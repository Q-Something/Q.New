import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { differenceInCalendarDays, addDays, format } from "date-fns";
import { RewardCoin } from "./RewardCoin";

// ✅ Define the correct type
interface StreakCollection {
  user_id: string;
  collected_at: string; // ISO string
  streak_day: number;
  streak_start_date: string;
}

// ✅ Function to get current streak start date or reset if needed
function getStreakStartDate(today: Date, collections: StreakCollection[]) {
  if (!collections.length) return today.toISOString().slice(0, 10);

  const sorted = collections
    .sort((a, b) => new Date(b.collected_at).getTime() - new Date(a.collected_at).getTime());

  const latest = sorted[0];
  const completed = collections.filter(c => c.streak_start_date === latest.streak_start_date);
  const all7Collected = completed.length === 7;

  const lastCollectedDate = new Date(latest.collected_at);
  const todayDiff = differenceInCalendarDays(today, lastCollectedDate);

  if (all7Collected && todayDiff >= 1) {
    return today.toISOString().slice(0, 10); // start new streak
  }

  return latest.streak_start_date;
}

export const DailyStreakCollector: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<StreakCollection[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const streakCollections = useMemo(
    () =>
      collections
        .filter((c) => c.streak_start_date === currentStreakStart)
        .sort((a, b) => a.streak_day - b.streak_day),
    [collections, currentStreakStart]
  );

  const streakDays = useMemo(
    () =>
      [...Array(7)].map((_, i) => {
        const found = streakCollections.find((c) => c.streak_day === i + 1);
        return found
          ? { collected: true, collectedAt: found.collected_at?.slice(0, 10) }
          : { collected: false };
      }),
    [streakCollections]
  );

  const lastCollection = streakCollections.at(-1);
  const nextAllowedDayIdx = streakDays.findIndex((d) => !d.collected);

  let canCollect = false;
  let disabledReason = "";
  let nextAvailableDate: string | null = null;

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
      nextAvailableDate = format(addDays(lastCollectDate, 1), "yyyy-MM-dd");
      disabledReason = `Next available: ${nextAvailableDate}`;
    } else {
      canCollect = false;
      disabledReason = "You missed a day! Streak reset.";
    }
  }

  const handleCollect = async (day: number) => {
    if (!user) return;
    if (day !== nextAllowedDayIdx + 1 || !canCollect) {
      toast({
        title: "Not allowed",
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

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setError(error.message);
      } else {
        toast({
          title: "Coins Collected!",
          description: (
            <div className="flex items-center gap-2">
              <RewardCoin animate />
              <span>
                You've collected <b>5 coins</b> for Day {day}! 🎉
              </span>
            </div>
          ),
        });

        const { data } = await supabase
          .from("daily_streak_collections")
          .select("*")
          .eq("user_id", user.id)
          .order("collected_at", { ascending: true });
        setCollections(data || []);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow max-w-md mx-auto mt-8 animate-fade-in">
      <div className="flex flex-col items-center">
        <RewardCoin animate={canCollect && !loading} />
        <h2 className="text-xl font-bold mb-2 text-center">
          7-Day Daily Streak <span className="text-yellow-500">Coin Collector</span>
        </h2>
        <p className="mb-4 text-center text-muted-foreground">
          Collect <span className="font-semibold">5 coins</span> daily by logging in and pressing the golden coin each day.
          <br />
          <span className="text-xs text-gray-500">One reward per day. Missing a day resets your streak!</span>
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {streakDays.map((d, i) => {
              const locked = i !== nextAllowedDayIdx || !canCollect;
              return (
                <Button
                  key={i}
                  disabled={d.collected || locked}
                  className={`flex flex-col items-center p-2 h-20 transition-all ${
                    d.collected ? "bg-green-200 text-green-900" : ""
                  } ${locked ? "opacity-60" : "hover-scale animate-fade-in"}`}
                  onClick={() => handleCollect(i + 1)}
                >
                  <RewardCoin animate={!d.collected && !locked} />
                  <span className="font-semibold">Day {i + 1}</span>
                  {d.collected ? (
                    <span className="text-xs text-green-700">Collected</span>
                  ) : locked ? (
                    <span className="text-xs text-gray-400">
                      {disabledReason && i === nextAllowedDayIdx
                        ? disabledReason
                        : "Locked"}
                    </span>
                  ) : (
                    <span className="text-xs text-yellow-600">Collect</span>
                  )}
                </Button>
              );
            })}
          </div>
          {streakDays.every((d) => d.collected) && (
            <div className="bg-green-100 text-green-700 px-3 py-2 rounded text-center mt-4 animate-fade-in">
              🎉 You've completed the 7-day streak! A new one will start tomorrow.
            </div>
          )}
        </>
      )}
    </div>
  );
};
