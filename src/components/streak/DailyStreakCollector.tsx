import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { differenceInCalendarDays, addDays, format, differenceInSeconds } from "date-fns";
import { RewardCoin } from "./RewardCoin";

interface StreakCollection {
  user_id: string;
  collected_at: string;
  streak_day: number;
  streak_start_date: string;
}

function getStreakStartDate(today: Date, collections: StreakCollection[]): string {
  if (!collections.length) return today.toISOString().slice(0, 10);

  const sorted = collections.sort(
    (a, b) => new Date(b.collected_at).getTime() - new Date(a.collected_at).getTime()
  );

  const latest = sorted[0];
  const completed = collections.filter(c => c.streak_start_date === latest.streak_start_date);
  const all7Collected = completed.length === 7;

  const lastCollectedDate = new Date(latest.collected_at);
  const todayDiff = differenceInCalendarDays(today, lastCollectedDate);

  if (all7Collected && todayDiff >= 1) {
    return today.toISOString().slice(0, 10);
  }

  return latest.streak_start_date;
}

export const DailyStreakCollector: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<StreakCollection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const today = new Date();

  useEffect(() => {
    if (!user) return;

    const fetchCollections = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("daily_streak_collections")
          .select("*")
          .eq("user_id", user.id)
          .order("collected_at", { ascending: true });
        if (error) throw error;
        setCollections(data || []);
      } catch (err: any) {
        setError(err.message || "Error loading streaks.");
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [user]);

  const currentStreakStart = useMemo(() => getStreakStartDate(today, collections), [collections]);

  const streakCollections = useMemo(() => {
    return collections
      .filter((c) => c.streak_start_date === currentStreakStart)
      .sort((a, b) => a.streak_day - b.streak_day);
  }, [collections, currentStreakStart]);

  const streakDays = useMemo(() => {
    return [...Array(7)].map((_, i) => {
      const found = streakCollections.find((c) => c.streak_day === i + 1);
      return found
        ? { collected: true, collectedAt: found.collected_at?.slice(0, 10) }
        : { collected: false };
    });
  }, [streakCollections]);

  const lastCollection = streakCollections.at(-1);
  const nextAllowedDayIdx = streakDays.findIndex((d) => !d.collected);

  let canCollect = false;
  let disabledReason = "";
  let nextAvailableDate: Date | null = null;

  if (nextAllowedDayIdx === 0) {
    canCollect =
      !streakDays[0].collected &&
      (!lastCollection || differenceInCalendarDays(today, new Date(lastCollection.collected_at)) >= 0);
  } else if (nextAllowedDayIdx > 0 && lastCollection) {
    const lastCollectDate = new Date(lastCollection.collected_at);
    const diff = differenceInCalendarDays(today, lastCollectDate);
    if (diff === 1) {
      canCollect = true;
    } else if (diff < 1) {
      canCollect = false;
      nextAvailableDate = addDays(lastCollectDate, 1);
    } else {
      canCollect = false;
      disabledReason = "Missed a day. Streak reset.";
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (nextAvailableDate && !canCollect) {
      const updateCountdown = () => {
        const now = new Date();
        const seconds = Math.max(0, differenceInSeconds(nextAvailableDate as Date, now));
        setCountdown(seconds);
      };

      updateCountdown();
      interval = setInterval(updateCountdown, 1000);
    }

    return () => clearInterval(interval);
  }, [nextAvailableDate, canCollect]);

  const formatCountdown = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCollect = async (day: number) => {
    if (!user) return;
    if (day !== nextAllowedDayIdx + 1 || !canCollect) {
      toast({
        title: "Not Allowed",
        description: "You can only collect one reward per day, in order.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("daily_streak_collections").insert({
        user_id: user.id,
        streak_start_date: currentStreakStart,
        streak_day: day,
      });

      if (error) throw error;

      toast({
        title: "Reward Collected",
        description: `You've collected 5 coins for Day ${day}.`,
      });

      const { data } = await supabase
        .from("daily_streak_collections")
        .select("*")
        .eq("user_id", user.id)
        .order("collected_at", { ascending: true });
      setCollections(data || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl max-w-3xl mx-auto mt-10 border border-gray-300">
      <div className="text-center mb-6">
        <RewardCoin animate={canCollect && !loading} />
        <h2 className="text-3xl font-bold mt-4">
          Daily Streak <span className="text-yellow-600">Reward Tracker</span>
        </h2>
        <p className="text-gray-700 mt-2 text-base">
          Earn <strong>5 coins</strong> each day you log in and collect. Complete 7 days to reset and earn again.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Collect one reward per day. Missing a day resets the streak.
        </p>

        {countdown !== null && countdown > 0 && (
          <div className="mt-4 inline-block px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
            Next reward available in: {formatCountdown(countdown)}
          </div>
        )}

        {disabledReason && !countdown && (
          <div className="mt-4 text-red-600 text-sm font-medium">{disabledReason}</div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        </div>
      ) : error ? (
        <div className="text-red-600 text-center text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {streakDays.map((d, i) => {
            const locked = i !== nextAllowedDayIdx || !canCollect;
            return (
              <Button
                key={i}
                onClick={() => handleCollect(i + 1)}
                disabled={d.collected || locked}
                className={`flex flex-col items-center justify-center h-24 rounded-xl border text-xs font-medium transition-all duration-300 shadow-sm hover:shadow-md ${
                  d.collected
                    ? "bg-green-200 border-green-400 text-green-900"
                    : locked
                    ? "border-gray-300 text-gray-400 bg-gray-100"
                    : "border-yellow-400 text-yellow-800 bg-yellow-50 hover:bg-yellow-100"
                }`}
              >
                <RewardCoin animate={!d.collected && !locked} />
                <div className="mt-1">Day {i + 1}</div>
                {d.collected ? (
                  <div className="text-green-800 mt-0.5">Collected</div>
                ) : locked ? (
                  <div className="text-gray-400 mt-0.5 text-[10px]">Locked</div>
                ) : (
                  <div className="text-yellow-700 mt-0.5">Collect</div>
                )}
              </Button>
            );
          })}
        </div>
      )}

      {!loading && streakDays.every((d) => d.collected) && (
        <div className="mt-6 p-4 bg-blue-100 text-blue-800 rounded-lg text-sm text-center border border-blue-300">
          You’ve completed your 7-day streak! A new streak begins tomorrow.
        </div>
      )}
    </div>
  );
};
