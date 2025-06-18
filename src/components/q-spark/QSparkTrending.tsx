import { useEffect, useState } from "react";
import { fetchTopUsers } from "@/lib/api/leaderboard-api";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

// Local fallback avatars (deterministic)
import pfp1 from "@/assets/pfp/pfp1.png";
import pfp2 from "@/assets/pfp/pfp2.png";
import pfp3 from "@/assets/pfp/pfp3.png";
import pfp4 from "@/assets/pfp/pfp4.png";

const fallbackAvatars = [pfp1, pfp2, pfp3, pfp4];

// Helper to assign avatar based on user ID
function getFallbackAvatar(userId?: string): string {
  const index = userId ? parseInt(userId.replace(/\D/g, "").slice(-1)) % fallbackAvatars.length : 0;
  return fallbackAvatars[index];
}

export function QSparkTrending() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopUsers(3).then((res) => {
      setLeaders(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 items-center animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="rounded-full bg-muted w-10 h-10 flex items-center justify-center" />
            <span className="text-xs mt-1 bg-muted w-12 h-3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-center">
      {leaders.map((leader) => {
        const avatarSrc = getFallbackAvatar(leader.user_id);
        return (
          <div key={leader.user_id} className="flex flex-col items-center">
            <Avatar className="w-10 h-10 mb-1">
              <AvatarImage src={avatarSrc} alt={leader.display_name || "User"} />
            </Avatar>
            <span className="text-xs font-medium">{leader.display_name}</span>
            <span className="text-[10px] text-muted-foreground">{leader.followers_count} sparks</span>
          </div>
        );
      })}
    </div>
  );
}
