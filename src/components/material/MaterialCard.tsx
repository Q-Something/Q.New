
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Trash } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { downloadStudyMaterial, StudyMaterial } from "@/lib/api/material-api";

interface MaterialCardProps {
  material: StudyMaterial;
  onDelete?: (material: StudyMaterial) => void;
  canDelete: boolean;
  onDownloadUpdate?: (materialId: string, newCount: number) => void;
}

export function MaterialCard({ material, onDelete, canDelete, onDownloadUpdate }: MaterialCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [localDownloadCount, setLocalDownloadCount] = useState(material.downloads);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      console.log("Downloading material:", material.id, "Current count:", localDownloadCount);
      
      const { url, newCount } = await downloadStudyMaterial(material);
      
      // Update local state immediately
      setLocalDownloadCount(newCount);
      
      // Update parent component state
      if (onDownloadUpdate) {
        onDownloadUpdate(material.id, newCount);
      }
      
      // Open the URL in a new tab
      window.open(url, '_blank');
      
      console.log("Download successful, new count:", newCount);
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download material");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl truncate">{material.title}</CardTitle>
          {material.flagged && (
            <Badge variant="destructive">Flagged</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{material.subject}</Badge>
          <Badge variant="secondary">{material.format.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <CardDescription className="line-clamp-3 mb-2">
          {material.description || "No description provided."}
        </CardDescription>
        <div className="text-sm text-muted-foreground">
          <p>Uploaded by: {material.uploaded_by || "Unknown"}</p>
          <p>Date: {new Date(material.created_at).toLocaleDateString()}</p>
          <p>Downloads: {localDownloadCount}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1" disabled>
          <FileText className="mr-2 h-4 w-4" /> Preview
        </Button>
        <Button 
          className="flex-1" 
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <Download className="mr-2 h-4 w-4" /> {isDownloading ? "Downloading..." : "Download"}
        </Button>
        {canDelete && onDelete && (
          <Button 
            variant="destructive" 
            size="icon"
            onClick={() => onDelete(material)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
