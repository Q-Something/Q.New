import React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Medal, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

// 🖼️ Local fallback avatars
import pfp1 from "@/assets/pfp/pfp1.png";
import pfp2 from "@/assets/pfp/pfp2.png";
import pfp3 from "@/assets/pfp/pfp3.png";
import pfp4 from "@/assets/pfp/pfp4.png";

type Leader = {
  user_id: string;
  display_name: string;
  total_points: number;
  login_streak: number;
  followers_count?: number;
};

interface LeaderboardCardProps {
  leaders: Leader[];
  showSparks?: boolean;
  sparkBy?: "followers_count";
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  leaders,
  showSparks,
  sparkBy,
}) => {
  const fallbackAvatars = [pfp1, pfp2, pfp3, pfp4];

  return (
    <div className="bg-white rounded-lg shadow max-w-full w-full md:w-[420px] mx-auto border p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Medal className="text-yellow-400" size={22} />
        <h2 className="font-bold text-xl">Overall Leaderboard</h2>
      </div>

      {leaders.length === 0 && (
        <div className="text-center text-muted-foreground py-6">
          No data yet. Be the first to earn sparks!
        </div>
      )}

      <ol className="divide-y">
        {leaders.map((leader, idx) => {
          // Assign one of the 4 fallback avatars deterministically
          const fallbackIndex = leader.user_id
            ? parseInt(leader.user_id.replace(/\D/g, "").slice(-1)) % fallbackAvatars.length
            : 0;
          const assignedPfp = fallbackAvatars[fallbackIndex];

          return (
            <li
              key={leader.user_id}
              className={cn("flex items-center gap-3 py-2", idx < 3 && "font-bold")}
            >
              <span className="w-6 text-center">{idx + 1}</span>
              <Avatar
                className={cn(
                  idx === 0 && "ring-2 ring-yellow-300",
                  "shrink-0 h-10 w-10"
                )}
              >
                <AvatarImage src={assignedPfp} alt={leader.display_name} />
              </Avatar>
              <span className="flex-1">{leader.display_name || "Student"}</span>
              <span className="ml-auto flex flex-col text-xs items-end space-y-1">
                {showSparks && (
                  <span className="flex items-center gap-1 text-yellow-600 font-bold">
                    <Coins size={16} className="text-yellow-600" />
                    {leader.followers_count ?? 0} Sparks
                  </span>
                )}
                <span className="flex items-center gap-1 text-primary">
                  {leader.total_points} pts
                </span>
                {leader.login_streak > 1 && (
                  <span className="text-muted-foreground">
                    Streak: {leader.login_streak}🔥
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
