import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { increment } from "@/integrations/supabase/rpc-functions";

export interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  format: string;
  file_path: string;
  created_at: string;
  user_id: string;
  downloads: number;
  uploaded_by?: string;
  flagged?: boolean;
  user_info?: {
    id: string;
    username: string;
  };
}

export async function fetchStudyMaterials(): Promise<StudyMaterial[]> {
  try {
    // Use a proper join query instead of the foreign key reference
    const { data, error } = await supabase
      .from('study_materials')
      .select(`
        *,
        profiles:user_id (username, id)
      `);
      
    if (error) throw error;
    
    return (data || []).map((material: any) => ({
      ...material,
      uploaded_by: material.profiles?.username || 'Unknown',
      downloads: material.downloads || 0, // Ensure downloads is always a number
      user_info: {
        id: material.profiles?.id,
        username: material.profiles?.username
      }
    }));
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
}

export async function uploadStudyMaterial(
  file: File,
  title: string,
  description: string,
  subject: string
): Promise<StudyMaterial> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error('You must be logged in to upload materials');
    }
    
    console.log('Starting upload process for file:', file.name, file.type);
    
    // Upload the file directly to storage - no need to check bucket since we created it via SQL
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `${userData.user.id}/${fileName}`;
    
    console.log('Uploading file to path:', filePath);
    const { error: uploadError } = await supabase.storage
      .from('study_materials')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }
    
    console.log('File uploaded successfully to path:', filePath);
    
    // Then create a record in the database
    const { data: material, error: dbError } = await supabase
      .from('study_materials')
      .insert({
        title,
        description,
        subject,
        format: file.name.split('.').pop() || 'pdf',
        file_path: filePath,
        user_id: userData.user.id,
        downloads: 0,
        flagged: false
      })
      .select()
      .single();
      
    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }
    
    console.log('Material record created:', material);
    
    return material;
  } catch (error: any) {
    console.error('Error uploading material:', error);
    throw error;
  }
}

export async function downloadStudyMaterial(material: StudyMaterial): Promise<{ url: string; newCount: number }> {
  try {
    console.log('Starting download for material:', material.id, 'Current downloads:', material.downloads);
    
    // First log this download in the downloads tracking table
    const { data: user } = await supabase.auth.getUser();
    
    // Use explicit insert into material_downloads table
    const { error: logError } = await supabase.from('material_downloads').insert({
      material_id: material.id,
      user_id: user?.user?.id || null,
      downloaded_at: new Date().toISOString()
    });
    
    if (logError) {
      console.error('Failed to log download:', logError);
    }
    
    // Increment download counter in database and get updated value
    const updatedCount = await increment('study_materials', 'downloads', material.id, 1);
    console.log('Download count incremented to:', updatedCount);
      
    // Get download URL
    const { data, error } = await supabase.storage
      .from('study_materials')
      .createSignedUrl(material.file_path, 60);
      
    if (error) throw error;
    
    if (!data || !data.signedUrl) {
      throw new Error('Failed to generate download URL');
    }
    
    return { url: data.signedUrl, newCount: updatedCount };
  } catch (error) {
    console.error('Error downloading material:', error);
    throw error;
  }
}

export async function deleteStudyMaterial(material: StudyMaterial): Promise<void> {
  try {
    // First check if the user owns this file
    const { data: user } = await supabase.auth.getUser();
    
    if (!user?.user) {
      throw new Error('You must be logged in to delete materials');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('study_materials')
      .remove([material.file_path]);
      
    if (storageError) {
      console.warn('Failed to delete file from storage:', storageError);
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', material.id);
      
    if (dbError) throw dbError;
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
}

export async function toggleFlagStatus(id: string, flagged: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('study_materials')
      .update({ flagged })
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error toggling flag status:', error);
    throw error;
  }
}
