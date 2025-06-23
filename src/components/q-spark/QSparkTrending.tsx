import { useEffect, useState } from "react";
import { fetchTopUsers } from "@/lib/api/leaderboard-api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
      {leaders.map((leader) => (
        <div key={leader.user_id} className="flex flex-col items-center">
          <Avatar className="h-10 w-10">
            {leader.avatar_url ? (
              <AvatarImage src={leader.avatar_url} alt={leader.display_name} />
            ) : (
              <AvatarFallback>
                {leader.display_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="text-xs mt-1">{leader.display_name}</span>
          <span className="text-[10px] text-muted-foreground">{leader.followers_count} sparks</span>
        </div>
      ))}
    </div>
  );
}
