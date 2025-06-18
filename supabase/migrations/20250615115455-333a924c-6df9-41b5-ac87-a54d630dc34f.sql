
-- 1. Table for Q.Story uploads
CREATE TABLE public.qstories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  pdf_file TEXT NOT NULL, -- storage bucket key/path
  uploader_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  likes_count INTEGER NOT NULL DEFAULT 0,
  bookmark_count INTEGER NOT NULL DEFAULT 0,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Bookmarked stories relationship (many-to-many user <-> qstories)
CREATE TABLE public.qstory_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  story_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, story_id)
);

-- 3. Story likes (many-to-many user <-> qstories)
CREATE TABLE public.qstory_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  story_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, story_id)
);

-- 4. Storage bucket for story PDFs (public view, but hide download/print/copy from UI)
insert into storage.buckets (id, name, public)
values ('qstory', 'qstory', true);

-- 5. RLS: Only uploader and admin can see pending/rejected stories; all users can see approved.
ALTER TABLE public.qstories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users & admin can view their own or approved stories"
  ON public.qstories
  FOR SELECT
  USING (
    status = 'approved'
    OR uploader_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Uploader can insert story"
  ON public.qstories
  FOR INSERT
  WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "Uploader can delete their pending/rejected story"
  ON public.qstories
  FOR DELETE
  USING (
    uploader_id = auth.uid() AND status != 'approved'
  );

CREATE POLICY "Admin can update any story status"
  ON public.qstories
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Bookmarks: each user can change/bookmark their own only
ALTER TABLE public.qstory_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can bookmark/unbookmark own" ON public.qstory_bookmarks
  FOR ALL USING (user_id = auth.uid());

-- Story Likes: same as above
ALTER TABLE public.qstory_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can like/unlike own" ON public.qstory_likes
  FOR ALL USING (user_id = auth.uid());

-- 6. Trigger: When a like is inserted, increment likes_count and add 5 pts to uploader's user_points; when unliked, decrement.
CREATE OR REPLACE FUNCTION public.handle_story_like()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE qstories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
    -- Add 5 pts to uploader's user_points (do nothing if no row exists)
    UPDATE user_points SET total_points = total_points + 5
      WHERE user_id = (SELECT uploader_id FROM qstories WHERE id = NEW.story_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE qstories SET likes_count = GREATEST(likes_count - 1,0) WHERE id = OLD.story_id;
    UPDATE user_points SET total_points = GREATEST(total_points - 5, 0)
      WHERE user_id = (SELECT uploader_id FROM qstories WHERE id = OLD.story_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS qstory_like_update ON public.qstory_likes;
CREATE TRIGGER qstory_like_update
AFTER INSERT OR DELETE ON public.qstory_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_story_like();

-- 7. Trigger: When bookmark/unbookmark, update bookmark count for the story.
CREATE OR REPLACE FUNCTION public.handle_story_bookmark()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE qstories SET bookmark_count = bookmark_count + 1 WHERE id = NEW.story_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE qstories SET bookmark_count = GREATEST(bookmark_count - 1,0) WHERE id = OLD.story_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS qstory_bookmark_update ON public.qstory_bookmarks;
CREATE TRIGGER qstory_bookmark_update
AFTER INSERT OR DELETE ON public.qstory_bookmarks
FOR EACH ROW EXECUTE FUNCTION public.handle_story_bookmark();
