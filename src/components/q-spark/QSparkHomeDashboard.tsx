// Import statements
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { Sparkles, UserPlus, MessageCircle, Brain, Settings, TrendingUp } from "lucide-react";
import { useQSparkActivityFeed } from "./hooks/useQSparkActivityFeed";
import { QSparkTrending } from "./QSparkTrending";
import { Avatar } from "@/components/ui/avatar";

interface QSparkHomeDashboardProps {
  currentProfile: any;
  onProfileClick: () => void;
  setActiveTab: (tab: string) => void;
}

export function QSparkHomeDashboard({
  currentProfile,
  onProfileClick,
  setActiveTab,
}: QSparkHomeDashboardProps) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-12">
      {/* Sidebar Welcome and Stats */}
      <div className="flex-1 min-w-[240px]">
        <div className="bg-muted/40 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-1">
            Hi {currentProfile?.display_name
              ? currentProfile.display_name.split(" ")[0]
              : user?.email?.split("@")[0] || "there"}
            !
          </h2>
          <p className="text-muted-foreground mb-4">
            Let's connect, learn, and grow together on Q.Spark.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex flex-col items-center rounded bg-background p-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="font-bold">{currentProfile?.followers_count ?? "—"}</span>
              <span className="text-xs">Sparks</span>
            </div>
            <div className="flex flex-col items-center rounded bg-background p-2">
              <UserPlus className="w-5 h-5 text-blue-500" />
              <span className="font-bold">{currentProfile?.following_count ?? "—"}</span>
              <span className="text-xs">Sparked</span>
            </div>
            <div className="flex flex-col items-center rounded bg-background p-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="font-bold">{currentProfile?.mutual_sparks_count ?? "—"}</span>
              <span className="text-xs">Mutual</span>
            </div>
          </div>

          <Button className="w-full mt-4" onClick={onProfileClick}>
            <Settings className="w-4 h-4 mr-2" /> Profile Settings
          </Button>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col gap-2 mb-4">
          <Button variant="outline" onClick={() => setActiveTab("search")}>
            <UserPlus className="w-4 h-4 mr-2" /> Find Students
          </Button>
          <Button variant="outline" onClick={() => setActiveTab("suggestions")}>
            <Brain className="w-4 h-4 mr-2" /> See Suggestions
          </Button>
          <Button variant="outline" onClick={() => setActiveTab("messages")}>
            <MessageCircle className="w-4 h-4 mr-2" /> Go to Messages
          </Button>
        </div>
      </div>

      {/* Activity Feed and Trending */}
      <div className="flex-1">
        <div className="bg-muted/40 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-lg mb-2">Recent Activity</h3>
          <QSparkActivityFeed />
        </div>
        <div className="p-4 bg-blue-50 rounded-xl mt-2">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
            <span className="font-semibold">Trending Students</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Checkout the most sparked students this week!
          </p>
          <QSparkTrending />
        </div>
      </div>
    </div>
  );
}

// --- Activity Feed Component ---
function QSparkActivityFeed() {
  const { activity, loading, refresh } = useQSparkActivityFeed(4);

  if (loading) {
    return (
      <ul className="animate-pulse text-sm space-y-2">
        {[...Array(4)].map((_, i) => (
          <li key={i}>
            <span className="inline-block bg-muted h-4 w-48 rounded" />
          </li>
        ))}
      </ul>
    );
  }

  if (!activity || !activity.follows || activity.follows.length === 0) {
    return <div className="text-muted-foreground">No recent spark/unspark activity.</div>;
  }

  return (
    <ul className="text-sm space-y-2">
      {activity.follows.map((f: any) => {
        const avatarSrc = f.following?.avatar_url || f.following?.display_name?.charAt(0) || "";
        return (
          <li key={"spark-" + f.id} className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover rounded-full" />
            </Avatar>
            <span className="font-semibold text-blue-500">{f.following?.display_name}</span>
            <span>sparked by you</span>
            <span className="text-xs text-muted-foreground ml-2">
              {formatTime(f.created_at)}
            </span>
          </li>
        );
      })}
      <li>
        <button className="text-xs text-blue-500 hover:underline mt-2" onClick={refresh}>
          Refresh
        </button>
      </li>
    </ul>
  );
}

// Format time helper
function formatTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (+now - +d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return d.toLocaleDateString();
}
