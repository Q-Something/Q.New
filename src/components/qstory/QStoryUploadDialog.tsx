
import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/context/auth-context";

export const QStoryUploadDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && (f.type !== "application/pdf" || f.size > 10 * 1024 * 1024)) {
      toast.warning("Upload a PDF file under 10MB only.");
      e.target.value = ""; // reset
      return;
    }
    setFile(f ?? null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to upload.");
      return;
    }
    if (!title.trim() || !file) {
      toast.error("Please fill all fields and select a PDF.");
      return;
    }
    setUploading(true);
    // Use unique filename
    const filename = `${Date.now()}-${file.name}`;
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("qstory").upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      toast.error("Failed to upload PDF: " + error.message);
      setUploading(false);
      return;
    }
    // Add to qstories table (status = pending)
    const { error: insertErr } = await supabase.from("qstories").insert({
      title,
      description: desc,
      pdf_file: filename,
      status: "pending",
      uploader_id: user.id,
    });
    if (insertErr) {
      toast.error("Failed to save story info: " + insertErr.message);
      setUploading(false);
      return;
    }
    toast.success("Story uploaded for review! You'll see it if approved.");
    onOpenChange(false);
    setUploading(false);
    setTitle("");
    setDesc("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full rounded-xl p-4">
        <DialogHeader>
          <DialogTitle>Upload a Q.Story (PDF Only, Max 10MB)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-3">
          <Input
            placeholder="Story Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={100}
          />
          <Input
            placeholder="Short Description (optional)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            maxLength={200}
          />
          <Input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            required
          />
          <Button type="submit" variant="default" className="w-full" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </form>
        <div className="text-xs text-muted-foreground mt-2">
          PDFs will be reviewed before publication. No download/print is enabled.
        </div>
      </DialogContent>
    </Dialog>
  );
};
