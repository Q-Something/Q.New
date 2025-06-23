import { supabase } from "@/integrations/supabase/client";

// Get top users, sorted consistently for the leaderboard. Limit is optional.
export async function fetchTopUsers(limit?: number) {
  let query = supabase
    .from("user_points")
    .select(`
      user_id,
      total_points,
      login_streak,
      spark_points,
      quiz_points,
      profiles:profiles!inner(id,display_name,avatar_url,followers_count)
    `)
    .order("total_points", { ascending: false, nullsFirst: false })
    .order("login_streak", { ascending: false, nullsFirst: false })
    .order("spark_points", { ascending: false, nullsFirst: false })
    .order("quiz_points", { ascending: false, nullsFirst: false })
    .order("user_id", { ascending: true }); // Older IDs get ranked higher on tie

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching top users:", error);
    throw error;
  }

  return (data || []).map(user => ({
    ...user,
    ...(user.profiles || {}),
    user_id: user.user_id,
    display_name: user.profiles?.display_name || 'Student',
    followers_count: user.profiles?.followers_count ?? 0,
  }));
}

// Get self leaderboard info
export async function fetchSelfPoints(user_id: string) {
  const { data, error } = await supabase
    .from("user_points")
    .select("*")
    .eq("user_id", user_id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
