import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Trash } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  downloadStudyMaterial,
  StudyMaterial,
} from "@/lib/api/material-api";

interface MaterialCardProps {
  material: StudyMaterial;
  onDelete?: (material: StudyMaterial) => void;
  canDelete: boolean;
  onDownloadUpdate?: (materialId: string, newCount: number) => void;
}

export function MaterialCard({
  material,
  onDelete,
  canDelete,
  onDownloadUpdate,
}: MaterialCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [localDownloadCount, setLocalDownloadCount] = useState(
    material.downloads
  );

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const { url, newCount } = await downloadStudyMaterial(material);
      setLocalDownloadCount(newCount);

      if (onDownloadUpdate) {
        onDownloadUpdate(material.id, newCount);
      }

      window.open(url, "_blank");
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download material");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col border border-zinc-700 shadow-sm hover:border-zinc-600 transition-colors">
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
        {/* Preview squeezes first */}
        <Button
          variant="outline"
          className="min-w-0 flex-1 basis-1/4 truncate"
          disabled
        >
          <FileText className="mr-2 h-4 w-4" /> Preview
        </Button>

        {/* Download squeezes second */}
        <Button
          className="min-w-0 flex-1 basis-1/3 truncate"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <Download className="mr-2 h-4 w-4" />{" "}
          {isDownloading ? "Downloading..." : "Download"}
        </Button>

        {/* Delete stays fixed size with red tone */}
        {canDelete && onDelete && (
          <Button
            onClick={() => onDelete(material)}
            className="w-10 bg-red-100 text-red-600 hover:bg-red-200"
            variant="ghost"
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
