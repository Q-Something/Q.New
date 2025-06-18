import { supabase } from "@/integrations/supabase/client";

export interface SparkProfile {
  id: string;
  display_name: string;
  username: string;
  age: number | null;
  education: string | null;
  hobbies: string | null;
  instagram: string | null;
  discord: string | null;
  sparked: boolean;
  spark_count: number;
}

export async function fetchProfiles(): Promise<SparkProfile[]> {
  try {
    const { data: user } = await supabase.auth.getUser();

    let sparked: string[] = [];
    if (user?.user) {
      const { data: sparkedData } = await supabase
        .from("sparked_friends")
        .select("friend_id")
        .eq("user_id", user.user.id);

      sparked = sparkedData?.map((item) => item.friend_id) || [];
    }

    console.log("Fetched sparked friends:", sparked);

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("spark_count", { ascending: false });

    if (error) throw error;

    const profilesArray = profiles || [];

    return profilesArray.map((profile) => ({
      id: profile.id,
      display_name: profile.display_name || "Unnamed User",
      username: profile.username || "unknown",
      age: profile.age,
      education: profile.education,
      hobbies: profile.hobbies,
      instagram: profile.instagram,
      discord: profile.discord,
      sparked: sparked.includes(profile.id),
      spark_count: profile.spark_count || 0,
    }));
  } catch (error) {
    console.error("Error fetching profiles:", error);
    throw error;
  }
}

export async function fetchSparkedProfiles(): Promise<SparkProfile[]> {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      throw new Error("User not authenticated");
    }

    const { data: sparkedFriends, error: sparkedError } = await supabase
      .from("sparked_friends")
      .select("friend_id")
      .eq("user_id", user.user.id);

    if (sparkedError) throw sparkedError;

    if (!sparkedFriends || sparkedFriends.length === 0) return [];

    const friendIds = sparkedFriends.map((item) => item.friend_id);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", friendIds);

    if (profilesError) throw profilesError;

    if (!profiles) return [];

    return profiles.map((profile) => ({
      id: profile.id,
      display_name: profile.display_name || "Unnamed User",
      username: profile.username || "unknown",
      age: profile.age,
      education: profile.education,
      hobbies: profile.hobbies,
      instagram: profile.instagram,
      discord: profile.discord,
      sparked: true,
      spark_count: profile.spark_count || 0,
    }));
  } catch (error) {
    console.error("Error fetching sparked profiles:", error);
    throw error;
  }
}

export async function toggleSpark(profileId: string, sparked: boolean): Promise<{ success: boolean }> {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      throw new Error("You must be logged in to spark a profile");
    }

    console.log("Toggling spark for profile:", profileId, "Current status:", sparked);

    if (sparked) {
      // Remove spark
      const { error: deleteError } = await supabase
        .from("sparked_friends")
        .delete()
        .eq("user_id", user.user.id)
        .eq("friend_id", profileId);

      if (deleteError) {
        console.error("Error removing spark:", deleteError);
        throw deleteError;
      }
    } else {
      // Add spark
      const { error: insertError } = await supabase
        .from("sparked_friends")
        .insert({
          user_id: user.user.id,
          friend_id: profileId,
        });

      if (insertError) {
        console.error("Error adding spark:", insertError);
        throw insertError;
      }
    }

    // Don't update spark_count or points — handled by SQL trigger
    return { success: true };
  } catch (error) {
    console.error("Error toggling spark:", error);
    throw error;
  }
}
