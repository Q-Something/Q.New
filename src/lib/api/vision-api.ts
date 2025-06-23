
import { supabase } from "@/integrations/supabase/client";

export interface ProcessImageResult {
  notes: string;
  questions: string;
  explanation: string;
  videos: {
    id: string;
    title: string;
    thumbnail: string;
  }[];
}

export async function processImage(file: File): Promise<ProcessImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const imageBase64 = event.target?.result as string;
        
        const { data, error } = await supabase.functions.invoke('process-image', {
          body: { image_base64: imageBase64 }
        });
        
        if (error) throw new Error(error.message);
        
        resolve(data as ProcessImageResult);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}
