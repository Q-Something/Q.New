
-- Update profiles table to support the new Q.Spark features
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS uid text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS class text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS exam_prep text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mutual_sparks_count integer DEFAULT 0;

-- Create unique index for UID
CREATE UNIQUE INDEX IF NOT EXISTS profiles_uid_unique ON public.profiles(uid);

-- Create follows table for the spark system
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create chat_rooms table for messaging
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_message_at timestamp with time zone,
  UNIQUE(user1_id, user2_id)
);

-- Create messages table for chat
CREATE TABLE IF NOT EXISTS public.chat_messages_new (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text', -- text, image, file
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages_new ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows table
CREATE POLICY "Users can view their own follows" ON public.follows
  FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create follows" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view their chat rooms" ON public.chat_rooms
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for chat_messages_new
CREATE POLICY "Users can view messages in their rooms" ON public.chat_messages_new
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE chat_rooms.id = chat_messages_new.room_id 
      AND (chat_rooms.user1_id = auth.uid() OR chat_rooms.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON public.chat_messages_new
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON public.chat_messages_new
  FOR UPDATE USING (auth.uid() = sender_id);

-- Function to update follow counts
CREATE OR REPLACE FUNCTION update_follow_counts() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    -- Increment followers count for followed user
    UPDATE public.profiles 
    SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
    -- Check if it's a mutual follow and update mutual sparks count
    IF EXISTS (
      SELECT 1 FROM public.follows 
      WHERE follower_id = NEW.following_id AND following_id = NEW.follower_id
    ) THEN
      UPDATE public.profiles 
      SET mutual_sparks_count = mutual_sparks_count + 1 
      WHERE id IN (NEW.follower_id, NEW.following_id);
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    UPDATE public.profiles 
    SET following_count = GREATEST(following_count - 1, 0) 
    WHERE id = OLD.follower_id;
    
    -- Decrement followers count for followed user
    UPDATE public.profiles 
    SET followers_count = GREATEST(followers_count - 1, 0) 
    WHERE id = OLD.following_id;
    
    -- Check if it was a mutual follow and update mutual sparks count
    IF EXISTS (
      SELECT 1 FROM public.follows 
      WHERE follower_id = OLD.following_id AND following_id = OLD.follower_id
    ) THEN
      UPDATE public.profiles 
      SET mutual_sparks_count = GREATEST(mutual_sparks_count - 1, 0) 
      WHERE id IN (OLD.follower_id, OLD.following_id);
    END IF;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for follow counts
DROP TRIGGER IF EXISTS update_follow_counts_trigger ON public.follows;
CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Update the existing handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  random_pfp text;
  base_uid text;
  final_uid text;
  counter integer := 1;
BEGIN
  -- Generate a random profile picture
  SELECT '/src/assets/pfp/pfp' || floor(random() * 4 + 1)::text || '.jpg' INTO random_pfp;
  
  -- Generate base UID from email
  base_uid := split_part(NEW.email, '@', 1);
  final_uid := base_uid;
  
  -- Ensure UID is unique
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE uid = final_uid) LOOP
    final_uid := base_uid || counter::text;
    counter := counter + 1;
  END LOOP;
  
  INSERT INTO public.profiles (
    id, 
    display_name, 
    username, 
    uid,
    avatar_url,
    followers_count,
    following_count,
    mutual_sparks_count
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), 
    split_part(NEW.email, '@', 1) || '_' || floor(random() * 10000)::text,
    final_uid,
    random_pfp,
    0,
    0,
    0
  );
  RETURN NEW;
END;
$$;

-- Enable realtime for chat functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages_new;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
