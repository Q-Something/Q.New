
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { uploadStudyMaterial } from "@/lib/api/material-api";

interface MaterialUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: () => void;
}

export function MaterialUploadDialog({ open, onOpenChange, onUploadSuccess }: MaterialUploadDialogProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadSubject, setUploadSubject] = useState("Mathematics");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("Selected file:", file.name, file.type);
      
      if (!file.type.includes('pdf')) {
        toast.error("Please upload a PDF file");
        return;
      }
      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle || !uploadSubject) {
      toast.error("Please fill in all required fields and select a file");
      return;
    }

    setIsUploading(true);
    
    try {
      console.log("Starting upload of:", uploadFile.name);
      await uploadStudyMaterial(
        uploadFile,
        uploadTitle,
        uploadDescription,
        uploadSubject
      );
      
      toast.success("Material uploaded successfully!");
      onOpenChange(false);
      
      // Reset form
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      setUploadSubject("Mathematics");
      
      // Notify parent to reload materials
      onUploadSuccess();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload material: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
          <DialogDescription>Share your notes and resources with the community</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title *</label>
            <Input 
              id="title" 
              placeholder="Enter material title" 
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Input 
              id="description" 
              placeholder="Describe the content" 
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">Subject *</label>
            <Select value={uploadSubject} onValueChange={setUploadSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
                <SelectItem value="Literature">Literature</SelectItem>
                <SelectItem value="History">History</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="file" className="text-sm font-medium">File (PDF only) *</label>
            <div 
              className="border-2 border-dashed rounded-lg border-muted-foreground/25 p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative"
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {uploadFile ? uploadFile.name : "Drag and drop or click to browse"}
              </p>
              <input 
                id="fileInput"
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={isUploading || !uploadFile || !uploadTitle || !uploadSubject}
          >
            {isUploading ? "Uploading..." : "Upload Material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
