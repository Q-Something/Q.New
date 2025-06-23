
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { QStory } from "./QStoryGallery";

export function useQStoryInteractions(story: QStory) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [working, setWorking] = useState(false);
  const [likeCount, setLikeCount] = useState(story.likes_count);
  const [bookmarkCount, setBookmarkCount] = useState(story.bookmark_count);

  useEffect(() => {
    if (!user) return;
    // Check if liked/bookmarked
    supabase
      .from("qstory_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("story_id", story.id)
      .single()
      .then(({ data }) => setLiked(!!data));
    supabase
      .from("qstory_bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("story_id", story.id)
      .single()
      .then(({ data }) => setBookmarked(!!data));
  }, [user, story.id]);

  // Like/Unlike handler
  const handleLike = async () => {
    if (!user) return;
    setWorking(true);
    if (!liked) {
      // Add like
      const { error } = await supabase.from("qstory_likes").insert({
        user_id: user.id,
        story_id: story.id,
      });
      if (!error) {
        setLiked(true);
        setLikeCount(c => c + 1);
      }
    } else {
      // Remove like
      const { error } = await supabase.from("qstory_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("story_id", story.id);
      if (!error) {
        setLiked(false);
        setLikeCount(c => Math.max(0, c - 1));
      }
    }
    setWorking(false);
  };

  // Bookmark handler
  const handleBookmark = async () => {
    if (!user) return;
    setWorking(true);
    if (!bookmarked) {
      const { error } = await supabase.from("qstory_bookmarks").insert({
        user_id: user.id,
        story_id: story.id,
      });
      if (!error) {
        setBookmarked(true);
        setBookmarkCount(c => c + 1);
      }
    } else {
      const { error } = await supabase.from("qstory_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("story_id", story.id);
      if (!error) {
        setBookmarked(false);
        setBookmarkCount(c => Math.max(0, c - 1));
      }
    }
    setWorking(false);
  };

  return {
    liked,
    bookmarked,
    likeCount,
    bookmarkCount,
    working,
    handleLike,
    handleBookmark
  };
}
