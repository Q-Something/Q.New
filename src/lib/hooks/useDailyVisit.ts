import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "@/hooks/use-toast";

// This version lets DB triggers award points for daily visits!
export function useDailyVisit() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!user || isLoading) return;

    const today = new Date();
    const yyyymmdd = today.toISOString().split("T")[0];

    async function recordVisit() {
      // Try to insert a visit; only succeed if first visit today
      const { error } = await supabase
        .from("daily_visits")
        .insert({ user_id: user.id, visit_date: yyyymmdd });

      if (!error) {
        toast({ description: "Welcome back! Daily visit recorded.", duration: 1800 });
        // DB trigger awards points; we just notify user.
      } else if (error.message.includes("duplicate")) {
        // Do nothing: already visited today
      } else {
        toast({ description: "Could not record your daily visit." });
      }
    }

    recordVisit();
  }, [user, isLoading]);
}
