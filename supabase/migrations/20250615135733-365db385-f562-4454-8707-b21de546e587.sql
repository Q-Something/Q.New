
-- Add a foreign key constraint to ensure qstories.uploader_id references profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'qstories_uploader_id_fkey'
      AND table_name = 'qstories'
  ) THEN
    ALTER TABLE public.qstories
    ADD CONSTRAINT qstories_uploader_id_fkey
    FOREIGN KEY (uploader_id)
    REFERENCES public.profiles(id);
  END IF;
END;
$$;

-- Create the qstory storage bucket if it doesn't exist, and make it public
insert into storage.buckets (id, name, public)
select 'qstory', 'qstory', true
where not exists (select 1 from storage.buckets where id = 'qstory');

-- Grant public read access to all files in qstory bucket
drop policy if exists "Public can read PDFs" on storage.objects;
create policy "Public can read PDFs"
  on storage.objects for select
  using (bucket_id = 'qstory');
