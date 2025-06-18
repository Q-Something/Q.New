
import { useAuth } from "@/lib/context/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useQStudyStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    testsAttempted: number;
    bestScore: number;
    currentStreak: number;
    lastTestDate: string | null;
    loading: boolean;
  }>({
    testsAttempted: 0,
    bestScore: 0,
    currentStreak: 0,
    lastTestDate: null,
    loading: true,
  });

  useEffect(() => {
    let ignore = false;
    async function fetchStats() {
      if (!user) {
        setStats((s) => ({ ...s, loading: false }));
        return;
      }
      // Get all test submissions ordered by submitted_at
      const { data, error } = await supabase
        .from("study_test_submissions")
        .select("submitted_at, total_score")
        .eq("student_id", user.id)
        .order("submitted_at");
      if (error || !Array.isArray(data)) {
        setStats((s) => ({ ...s, loading: false }));
        return;
      }
      const testsAttempted = data.length;
      const bestScore = data.reduce(
        (acc, cur) => Math.max(acc, Number(cur.total_score) || 0),
        0
      );
      // Compute streak - count consecutive days up to today
      let streak = 0;
      let today = new Date();
      let prevDay = null;
      for (let i = data.length - 1; i >= 0; i--) {
        const dateStr = data[i].submitted_at;
        if (!dateStr) continue;
        const d = new Date(dateStr);
        const dStr = d.toISOString().slice(0, 10);
        if (streak === 0) {
          // First date: today or yesterday
          const todayStr = today.toISOString().slice(0, 10);
          const yesterday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 1
          )
            .toISOString()
            .slice(0, 10);
          if (dStr === todayStr) {
            streak++;
          } else if (dStr === yesterday) {
            streak++;
            prevDay = dStr;
          } else {
            break;
          }
        } else if (prevDay) {
          const prev = new Date(prevDay);
          const prevPrevDay = new Date(
            prev.getFullYear(),
            prev.getMonth(),
            prev.getDate() - 1
          )
            .toISOString()
            .slice(0, 10);
          const dStrMatch = d.toISOString().slice(0, 10);
          if (dStrMatch === prevPrevDay) {
            streak++;
            prevDay = dStrMatch;
          } else {
            break;
          }
        }
      }
      const lastTestDate =
        data.length > 0 ? data[data.length - 1].submitted_at : null;
      if (!ignore)
        setStats({
          testsAttempted,
          bestScore,
          currentStreak: streak,
          lastTestDate,
          loading: false,
        });
    }
    fetchStats();
    return () => {
      ignore = true;
    };
  }, [user]);

  return stats;
}
