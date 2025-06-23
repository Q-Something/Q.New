
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/context/auth-context";
import { QStoryCard } from "./QStoryCard";
import { Loader2, Clock, CheckCircle2, XCircle, Heart, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QStory } from "./QStoryGallery";

const statusColor = {
  pending: "bg-yellow-200 text-yellow-800",
  approved: "bg-green-200 text-green-800",
  rejected: "bg-red-200 text-red-800",
};

const statusLabel = {
  pending: <><Clock className="inline w-4 h-4 mr-1" />Under Review</>,
  approved: <><CheckCircle2 className="inline w-4 h-4 mr-1" />Approved</>,
  rejected: <><XCircle className="inline w-4 h-4 mr-1" />Not Approved</>,
};

export const ProfileUploadedStories: React.FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<QStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyStories = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("qstories")
        .select("*")
        .eq("uploader_id", user.id)
        .order("upload_date", { ascending: false });

      setStories((data as QStory[]) ?? []);
      setLoading(false);
    };
    fetchMyStories();
  }, [user]);

  if (!user) return null;
  if (loading)
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" /> Loading your stories...
      </div>
    );
  if (stories.length === 0)
    return (
      <div className="p-8 text-center text-muted-foreground italic">
        You haven't uploaded any stories yet.
      </div>
    );

  return (
    <div>
      <h3 className="font-bold text-lg mb-2 text-blue-600">My Uploaded Stories</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stories.map((story) => (
          <div key={story.id} className="rounded-xl border bg-white p-4 relative shadow group">
            <div className="flex items-center gap-3 mb-2">
              <Badge className={`${statusColor[story.status as keyof typeof statusColor]} px-2.5 py-1 font-medium`}>
                {statusLabel[story.status as keyof typeof statusLabel]}
              </Badge>
              <span className="ml-auto text-xs text-muted-foreground">
                {new Date(story.upload_date).toLocaleDateString()}
              </span>
            </div>
            <div className="font-bold text-lg mb-1 flex items-center gap-2">{story.title}</div>
            <div className="mb-2 text-muted-foreground text-sm line-clamp-2">{story.description || <span className="italic opacity-60">No description</span>}</div>
            <div className="flex items-center gap-4 mb-2">
              <span className="flex items-center gap-1 text-blue-600 font-semibold">
                <Heart className="w-4 h-4" /> {story.likes_count}
              </span>
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Bookmark className="w-4 h-4" /> {story.bookmark_count}
              </span>
            </div>
            <Button variant="outline" size="sm" className="mt-1"
              onClick={() =>
                window.open(`/q-story?preview=${story.id}`, "_blank")
              }
              disabled={story.pdf_file === ""}
            >
              Preview Story
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
