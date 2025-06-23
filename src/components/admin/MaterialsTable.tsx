
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Flag, Trash, Download } from "lucide-react";
import { DeleteMaterialDialog } from "./DeleteMaterialDialog";

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  uploaded_by: string;
  created_at: string;
  downloads: number;
  flagged: boolean;
  file_path: string;
}

interface UserInfo {
  id: string;
  username: string;
}

interface MaterialsTableProps {
  materials: StudyMaterial[];
  setMaterials: React.Dispatch<React.SetStateAction<StudyMaterial[]>>;
  isLoading: boolean;
  reloadMaterials: () => void;
}

export function MaterialsTable({
  materials,
  setMaterials,
  isLoading,
  reloadMaterials,
}: MaterialsTableProps) {
  const [materialToDelete, setMaterialToDelete] = useState<StudyMaterial | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const confirmDelete = (material: StudyMaterial) => {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  const handleRemoveMaterial = async () => {
    if (!materialToDelete) return;
    try {
      const { error: storageError } = await supabase.storage
        .from('study_materials')
        .remove([materialToDelete.file_path]);
      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError);
      }
      const { error: dbError } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', materialToDelete.id);
      if (dbError) throw dbError;
      setMaterials(materials.filter(m => m.id !== materialToDelete.id));
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
      toast.success("Material removed successfully");
    } catch (error) {
      toast.error("Failed to remove material");
      console.error(error);
    }
  };

  const handleFlagToggle = async (material: StudyMaterial) => {
    try {
      const { error } = await supabase
        .from('study_materials')
        .update({ flagged: !material.flagged })
        .eq('id', material.id);
      if (error) throw error;
      setMaterials(materials.map(m => 
        m.id === material.id ? { ...m, flagged: !m.flagged } : m
      ));
      toast.success(material.flagged 
        ? "Material unflagged successfully" 
        : "Material flagged successfully"
      );
    } catch (error) {
      toast.error("Failed to update flag status");
      console.error(error);
    }
  };

  const handleDownload = async (material: StudyMaterial) => {
    try {
      const { data, error } = await supabase.storage
        .from('study_materials')
        .createSignedUrl(material.file_path, 60);
      if (error) throw error;
      if (!data || !data.signedUrl) {
        throw new Error('Failed to generate download URL');
      }
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error downloading material:', error);
      toast.error("Failed to download material");
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead>Flagged</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.length > 0 ? (
              materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>{material.title}</TableCell>
                  <TableCell>{material.subject}</TableCell>
                  <TableCell>{material.uploaded_by}</TableCell>
                  <TableCell>{new Date(material.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{material.downloads}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={material.flagged || false}
                      onCheckedChange={() => handleFlagToggle(material)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(material)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={material.flagged ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFlagToggle(material)}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => confirmDelete(material)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No materials found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DeleteMaterialDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleRemoveMaterial}
        onCancel={() => setMaterialToDelete(null)}
      />
    </>
  );
}
