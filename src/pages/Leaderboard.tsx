import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Coins, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/context/auth-context";
import { fetchTopUsers } from "@/lib/api/leaderboard-api";

// Local fallback avatars
import pfp1 from "@/assets/pfp/pfp1.png";
import pfp2 from "@/assets/pfp/pfp2.png";
import pfp3 from "@/assets/pfp/pfp3.png";
import pfp4 from "@/assets/pfp/pfp4.png";

const fallbackAvatars = [pfp1, pfp2, pfp3, pfp4];

const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selfRank, setSelfRank] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const allLeaders = await fetchTopUsers();
        setLeaders(allLeaders);

        if (user) {
          const selfIndex = allLeaders.findIndex((l) => l.user_id === user.id);
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
      <div className="max-w-md w-full mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">Leaderboard!!</h1>
        <p className="mb-4 text-center text-muted-foreground">
          Top students earning the most sparks are shown here.
          <br />
          More Sparks = More Points = More Recognition!
        </p>

        {user && selfRank && (
          <div className="mb-4 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-medium animate-fade-in">
              Your rank: #{selfRank}
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            No leaderboard data yet. Start learning to appear here!
          </div>
        ) : (
          <ol className="divide-y rounded-md border p-4 bg-white shadow">
            {leaders.map((leader, idx) => {
              const fallbackIndex = leader.user_id
                ? parseInt(leader.user_id.replace(/\D/g, "").slice(-1)) % fallbackAvatars.length
                : 0;
              const assignedPfp = fallbackAvatars[fallbackIndex];

              return (
                <li key={leader.user_id} className="flex items-center gap-3 py-2">
                  <span className="w-6 text-center">#{idx + 1}</span>
                  <Avatar className="shrink-0 h-10 w-10">
                    <AvatarImage src={assignedPfp} alt={leader.display_name} />
                  </Avatar>
                  <span className="flex-1 truncate">{leader.display_name || "Student"}</span>

                  <div className="flex flex-col text-xs items-end space-y-1">
                    <span className="text-primary font-semibold">
                      {leader.total_points} pts
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Coins size={14} /> {leader.spark_points || 0}
                    </span>
                    {leader.login_streak > 0 && (
                      <span className="text-muted-foreground">
                        Streak: {leader.login_streak}🔥
                      </span>
                    )}
                    {leader.quiz_points > 0 && (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Upload size={12} /> {leader.quiz_points}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <Button onClick={() => navigate("/")} variant="outline" className="mt-8 w-full">
          ← Back to Home
        </Button>
      </div>
    </div>
  );
};

export default LeaderboardPage;
