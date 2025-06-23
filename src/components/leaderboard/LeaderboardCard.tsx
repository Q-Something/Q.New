import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Medal, Coins, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchTopUsers } from "@/lib/api/leaderboard-api";

// Local fallback avatars
import pfp1 from "@/assets/pfp/pfp1.png";
import pfp2 from "@/assets/pfp/pfp2.png";
import pfp3 from "@/assets/pfp/pfp3.png";
import pfp4 from "@/assets/pfp/pfp4.png";

const fallbackAvatars = [pfp1, pfp2, pfp3, pfp4];

interface LeaderboardCardProps {
  currentUserId?: string;
  limit?: number; // NEW: optional prop to control how many users to display
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  currentUserId,
  limit = 15, // default to 15 if not specified
}) => {
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    const loadLeaders = async () => {
      try {
        const data = await fetchTopUsers(limit);
        setLeaders(data);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      }
    };
    loadLeaders();
  }, [limit]);

  const currentUserRank = leaders.findIndex((l) => l.user_id === currentUserId);
  const currentUserData = currentUserRank !== -1 ? leaders[currentUserRank] : null;

  return (
    <div className="bg-white rounded-lg shadow max-w-full w-full md:w-[420px] mx-auto border p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Medal className="text-yellow-400" size={22} />
        <h2 className="font-bold text-xl">Overall Leaderboard</h2>
      </div>

      {currentUserData && currentUserRank >= limit && (
        <div className="bg-muted text-sm text-muted-foreground px-3 py-2 rounded mb-3 flex items-center justify-between">
          <span className="font-semibold">#{currentUserRank + 1}</span>
          <span>{currentUserData.display_name || "You"}</span>
          <span className="text-primary font-medium">{currentUserData.total_points} pts</span>
        </div>
      )}

      {leaders.length === 0 && (
        <div className="text-center text-muted-foreground py-6">
          No data yet. Be the first to earn sparks!
        </div>
      )}

      <ol className="divide-y">
        {leaders.map((leader, idx) => {
          const fallbackIndex = leader.user_id
            ? parseInt(leader.user_id.replace(/\D/g, "").slice(-1)) % fallbackAvatars.length
            : 0;
          const assignedPfp = fallbackAvatars[fallbackIndex];

          return (
            <li
              key={leader.user_id}
              className={cn("flex items-center gap-3 py-2", idx < 3 && "font-bold")}
            >
              <span className="w-6 text-center">#{idx + 1}</span>
              <Avatar
                className={cn(
                  idx === 0 && "ring-2 ring-yellow-300",
                  "shrink-0 h-10 w-10"
                )}
              >
                <AvatarImage src={assignedPfp} alt={leader.display_name} />
              </Avatar>
              <span className="flex-1 truncate">{leader.display_name || "Student"}</span>

              <div className="flex flex-col text-xs items-end space-y-1">
                <span className="text-primary font-semibold">{leader.total_points} pts</span>
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
    </div>
  );
};
