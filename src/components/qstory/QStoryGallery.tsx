
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QStoryCard } from "./QStoryCard";

// include uploader fields
export interface QStory {
  id: string;
  title: string;
  description?: string;
  pdf_file: string;
  uploader_id: string;
  likes_count: number;
  bookmark_count: number;
  upload_date: string;
  status: string;
  uploader_name?: string;
  uploader_uid?: string;
}

export const QStoryGallery: React.FC = () => {
  const [stories, setStories] = useState<QStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // JOIN with profiles to fetch name/uid
    supabase
      .from("qstories")
      .select(`
        *,
        profiles:profiles!qstories_uploader_id_fkey (
          display_name,
          uid
        )
      `)
      .eq("status", "approved")
      .order("upload_date", { ascending: false })
      .then(({ data }) => {
        const mapped = (data ?? []).map((s: any) => ({
          ...s,
          uploader_name: s.profiles?.display_name ?? "",
          uploader_uid: s.profiles?.uid ?? "",
        }));
        setStories(mapped);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center text-muted-foreground p-6">Loading stories...</div>;
  if (stories.length === 0) return <div className="text-center p-8 text-muted-foreground">No stories yet. Be the first to share yours!</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {stories.map(s => <QStoryCard key={s.id} story={s} />)}
    </div>
  );
};
