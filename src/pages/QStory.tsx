
import React, { useState } from "react";
import { QStoryGallery } from "@/components/qstory/QStoryGallery";
import { QStoryUploadDialog } from "@/components/qstory/QStoryUploadDialog";
import { Button } from "@/components/ui/button";

const QStory: React.FC = () => {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="max-w-4xl mx-auto py-6 px-2 sm:px-6">
      <section className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
            <span role="img" aria-label="book">📚</span> Q.Story
          </h2>
          <p className="text-muted-foreground mt-1">
            Read, share, and be inspired by real student stories!
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)} variant="secondary">
          + Upload Your Story (PDF)
        </Button>
      </section>
      <QStoryGallery />
      {showUpload && (
        <QStoryUploadDialog open={showUpload} onOpenChange={setShowUpload} />
      )}
    </div>
  );
};
export default QStory;
