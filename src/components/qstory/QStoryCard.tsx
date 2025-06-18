
import React, { useState } from "react";
import { QStory } from "./QStoryGallery";
import { QStoryPDFViewer } from "./QStoryPDFViewer";
import { cn } from "@/lib/utils";
import { Bookmark, BookOpen, ThumbsUp, Loader2, User2, ExternalLink } from "lucide-react";
import { useQStoryInteractions } from "./useQStoryInteractions";
import { getQStoryPDFPublicUrl } from "./getQStoryPDFPublicUrl";

export const QStoryCard: React.FC<{ story: QStory }> = ({ story }) => {
  const [showPDF, setShowPDF] = useState(false);
  const { liked, bookmarked, handleLike, handleBookmark, likeCount, bookmarkCount, working } =
    useQStoryInteractions(story);

  return (
    <div className="rounded-xl bg-white border border-muted p-4 shadow hover:shadow-lg transition group">
      <h3 className="text-xl font-bold flex gap-1.5 items-center mb-1">{story.title} <BookOpen className="w-5 h-5 text-blue-400"/></h3>
      <div className="flex items-center text-sm mt-0.5 mb-1 text-muted-foreground gap-1">
        <User2 className="w-4 h-4 text-blue-400" />
        {story.uploader_name ? (
          <>
            by <span className="font-medium text-gray-700">{story.uploader_name}</span>
            {story.uploader_uid && (
              <span className="ml-1 text-xs opacity-70">@{story.uploader_uid}</span>
            )}
          </>
        ) : "Uploader"}
      </div>
      <div className="text-sm mb-2 min-h-[2em] text-muted-foreground line-clamp-2">
        {story.description || <span className="italic opacity-60">No description</span>}
      </div>
      <div className="flex items-center gap-4 mb-3">
        <button
          className={cn("flex gap-1 items-center text-blue-500 hover:text-blue-700 transition", liked && "font-bold text-blue-700")}
          disabled={working}
          onClick={handleLike}
          aria-label={liked ? "Unlike" : "Like"}
        >
          <ThumbsUp className="w-5 h-5"/> {likeCount}
        </button>
        <button
          className={cn("flex gap-1 items-center text-amber-400 hover:text-amber-600 transition", bookmarked && "font-bold text-amber-600")}
          disabled={working}
          onClick={handleBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
        >
          <Bookmark className="w-5 h-5"/> {bookmarkCount}
        </button>
        <span className="ml-auto text-xs text-muted-foreground">
          {new Date(story.upload_date).toLocaleDateString()}
        </span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          className="w-full text-white bg-blue-600 hover:bg-blue-700 py-1.5 rounded-lg font-medium transition"
          onClick={() => setShowPDF(true)}
        >
          Quick Preview
        </button>
        <a
          href={getQStoryPDFPublicUrl(story.pdf_file)}
          className="w-full flex items-center justify-center text-blue-700 border border-blue-300 hover:bg-blue-50 py-1.5 rounded-lg font-medium transition gap-1 mt-1 sm:mt-0"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="w-4 h-4" /> Read in New Tab
        </a>
      </div>
      {showPDF && (
        <QStoryPDFViewer
          pdfPath={story.pdf_file}
          onClose={() => setShowPDF(false)}
          title={story.title}
        />
      )}
    </div>
  );
};
