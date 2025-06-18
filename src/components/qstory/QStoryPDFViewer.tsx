
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";

// For security: don't render native controls, no download/print (set allow/disable as much as possible)
export const QStoryPDFViewer: React.FC<{
  pdfPath: string;
  onClose: () => void;
  title: string;
}> = ({ pdfPath, onClose, title }) => {
  const publicUrl = `https://fwnngoxzljdkcwkgkyqu.supabase.co/storage/v1/object/public/qstory/${pdfPath}`;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-2 bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-blue-700 text-lg">{title}</DialogTitle>
          <DialogClose asChild>
            <button className="ml-auto p-1"><X className="w-5 h-5"/></button>
          </DialogClose>
        </DialogHeader>
        <div className="h-[60vh] w-full overflow-y-auto">
          <iframe
            src={publicUrl + "#toolbar=0&navpanes=0&scrollbar=0"}
            className="w-full h-full border-0"
            title={title}
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin"
            style={{
              pointerEvents: "all"
            }}
          ></iframe>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            <b>No download/print/copy is allowed</b>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
