
-- Replace 'YOUR_USER_ID_HERE' with your actual user UUID if known.
-- This migration will add you as an admin so you can upload questions.

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM public.profiles
WHERE id = (SELECT id FROM public.profiles WHERE /* add disambiguator if you're not the only 11th PCM user, or use a known id */ class = '11th' AND stream = 'PCM')
ON CONFLICT DO NOTHING;

-- (No changes to policies needed unless you want anyone to upload questions!)

