
import React from "react";
import { BarChart3, Flame, Award, CalendarCheck2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQStudyStats } from "./useQStudyStats";

// For a bit of fun: some random achievement badges
const BADGES = [
  { label: "Streak Starter", icon: <Flame className="w-5 h-5 text-orange-500" /> },
  { label: "Quiz Hero", icon: <Award className="w-5 h-5 text-yellow-400" /> },
];

export const QStudyDashboard: React.FC = () => {
  const stats = useQStudyStats();

  if (stats.loading) return (
    <div className="flex justify-center mt-4 mb-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2" />
      <span className="text-muted-foreground">Loading your study stats...</span>
    </div>
  );

  // Encourage starting if no tests yet
  if (stats.testsAttempted === 0) {
    return (
      <div className="bg-muted/90 rounded-xl shadow border border-dashed border-primary/50 p-6 text-center mb-4 animate-fade-in">
        <div className="text-2xl font-bold mb-2">
          🚀 Start your first test today!
        </div>
        <div className="text-lg text-muted-foreground mb-4">
          Build your streak, earn badges, and rise to the top leaderboard.
        </div>
        <div className="flex justify-center gap-3">
          {BADGES.map(b => (
            <span
              key={b.label}
              className="bg-background inline-flex items-center gap-1 px-3 py-1 rounded-full border shadow text-base font-semibold"
            >
              {b.icon} {b.label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Main dashboard stats
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-fade-in">
      <Card className="flex flex-col items-center p-4 text-center bg-blue-50 border-blue-200 shadow hover-scale">
        <BarChart3 className="w-7 h-7 text-blue-600 mb-1" />
        <div className="font-bold text-lg">{stats.testsAttempted}</div>
        <div className="text-xs text-muted-foreground">Tests Attempted</div>
      </Card>
      <Card className="flex flex-col items-center p-4 text-center bg-amber-50 border-amber-200 shadow hover-scale">
        <Award className="w-7 h-7 text-amber-500 mb-1" />
        <div className="font-bold text-lg">{stats.bestScore}</div>
        <div className="text-xs text-muted-foreground">Best Score</div>
      </Card>
      <Card className="flex flex-col items-center p-4 text-center bg-pink-50 border-pink-200 shadow hover-scale">
        <Flame className="w-7 h-7 text-pink-500 mb-1 animate-pulse" />
        <div className="font-bold text-lg">{stats.currentStreak} {stats.currentStreak > 1 ? "days" : "day"}</div>
        <div className="text-xs text-muted-foreground">Current Streak</div>
      </Card>
    </div>
  );
};
