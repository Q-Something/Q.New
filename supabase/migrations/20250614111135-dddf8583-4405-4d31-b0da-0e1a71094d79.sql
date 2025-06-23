
-- Add reply_to column to chat_messages_new (for message replies)
ALTER TABLE public.chat_messages_new
ADD COLUMN IF NOT EXISTS reply_to uuid REFERENCES chat_messages_new(id);

-- (The message_reactions table already exists with the proper message_id and user_id. No schema changes needed there.)

-- (Optionally, you could add an index to reply_to for faster lookups.)
CREATE INDEX IF NOT EXISTS idx_chat_messages_new_reply_to ON public.chat_messages_new(reply_to);

-- If you have RLS enabled and want to allow updates/inserts on reply_to:
-- (Assumes existing policies already allow inserting messages for the user. If not, add policy for reply_to assignment as well.)
