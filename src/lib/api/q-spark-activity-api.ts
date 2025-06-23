
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches ONLY the logged-in user's recent spark/un-spark activity for QSpark dashboard.
 * Returns latest follows (who they sparked/un-sparked).
 */
export async function fetchQSparkActivityFeed(limit = 4) {
  // Get current user
  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (!authUser?.user) {
    return { follows: [], errors: ["Not authenticated"] };
  }

  // Only get YOUR actions as follower
  const { data: follows, error: followsErr } = await supabase
    .from("follows")
    .select(`
      id,
      follower_id,
      following_id,
      created_at,
      follower:profiles!follows_follower_id_fkey(id,display_name,avatar_url,uid),
      following:profiles!follows_following_id_fkey(id,display_name,avatar_url,uid)
    `)
    .eq("follower_id", authUser.user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return {
    follows: follows || [],
    errors: [authError, followsErr].filter(Boolean),
  };
}
