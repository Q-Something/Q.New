import React, { useEffect, useState } from "react";
import { LeaderboardCard } from "@/components/leaderboard/LeaderboardCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/context/auth-context";
import { fetchTopUsers } from "@/lib/api/leaderboard-api";

type SimpleUserLeaderboard = {
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
  total_points: number;
  login_streak: number;
  followers_count: number;
};

const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState<SimpleUserLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selfRank, setSelfRank] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        // Using the unified API call. No limit will fetch all users, already sorted.
        const allLeaders = await fetchTopUsers(); 
        setLeaders(allLeaders);

        if (user) {
          const selfIndex = allLeaders.findIndex(l => l.user_id === user.id);
          setSelfRank(selfIndex !== -1 ? selfIndex + 1 : null);
        } else {
          setSelfRank(null);
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        setLeaders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [user]);

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">Overall Leaderboard</h1>
          <p className="mb-4 text-muted-foreground">
            Top students earning the most sparks (followers) are shown here.<br/>
             More Sparks = More Points = More Social Recognition!
          </p>
          {user && selfRank && (
            <div className="mb-3">
              <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-medium animate-fade-in">
                Your rank: #{selfRank}
              </span>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin w-8 h-8" />
            </div>
          ) : (
            <LeaderboardCard 
              leaders={leaders} 
              showSparks
              sparkBy="followers_count" // tell child to show followers count as sparks
            />
          )}
          <Button onClick={() => navigate("/")} variant="outline" className="mt-8">
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
