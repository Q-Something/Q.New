
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { QStory } from "./QStoryGallery";
import { QStoryCard } from "./QStoryCard";
import { Loader2 } from "lucide-react";

// Locally extend QStory for bookmarked_at
type BookmarkedQStory = QStory & {
  bookmarked_at?: string;
};

export const ProfileBookmarkedStories: React.FC = () => {
  const { user } = useAuth();
  // Use the extended type here
  const [stories, setStories] = useState<BookmarkedQStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarked = async () => {
      if (!user) return;
      setLoading(true);
      // 1. Get bookmarked story IDs
      const { data: bookmarks, error: bookmarkErr } = await supabase
        .from("qstory_bookmarks")
        .select("story_id,created_at")
        .eq("user_id", user.id);

      if (bookmarkErr || !bookmarks) {
        setStories([]);
        setLoading(false);
        return;
      }

      const storyIds = bookmarks.map((bm: { story_id: string }) => bm.story_id);
      if (storyIds.length === 0) {
        setStories([]);
        setLoading(false);
        return;
      }

      // 2. Fetch stories with those IDs and "approved" status
      const { data: storiesData } = await supabase
        .from("qstories")
        .select("*")
        .in("id", storyIds)
        .eq("status", "approved");

      // Enrich with bookmark date
      const storyIdToBookmarkDate: Record<string, string> = {};
      for (const bm of bookmarks) {
        if (bm.story_id) storyIdToBookmarkDate[bm.story_id] = bm.created_at;
      }
      // Add 'bookmarked_at' field to each story
      const mappedStories = ((storiesData as QStory[]) ?? []).map((story) => ({
        ...story,
        bookmarked_at: storyIdToBookmarkDate[story.id] || undefined,
      }));

      // Order by when bookmarked (most recent first)
      mappedStories.sort((a, b) =>
        (b.bookmarked_at ?? "").localeCompare(a.bookmarked_at ?? "")
      );
      setStories(mappedStories);
      setLoading(false);
    };
    fetchBookmarked();
  }, [user]);

  if (!user) return null;
  if (loading)
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" /> Loading bookmarks...
      </div>
    );
  if (stories.length === 0)
    return (
      <div className="text-muted-foreground italic text-sm p-8">No bookmarked stories yet.</div>
    );
  return (
    <div>
      <h3 className="font-bold text-lg mb-2 text-blue-600">Bookmarked Stories</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stories.map((story) => (
          <div key={story.id} className="relative">
            <QStoryCard story={story} />
            {story.bookmarked_at && (
              <div className="absolute top-2 right-3 bg-amber-50 px-2 py-0.5 text-xs text-amber-600 rounded font-medium">
                Bookmarked: {new Date(story.bookmarked_at).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

