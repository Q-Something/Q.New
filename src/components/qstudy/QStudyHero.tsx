
import React from "react";
import { Trophy, BookOpen, Users, Star, Award } from "lucide-react";

export const QStudyHero: React.FC = () => {
  return (
    <section className="rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 shadow-xl p-5 text-white mb-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-8 h-8 text-yellow-300 drop-shadow-lg" />
          <span className="font-bold text-3xl tracking-wide">Q.Study</span>
          <Award className="w-7 h-7 ml-2 text-amber-100" />
        </div>
        <div className="text-lg font-medium mb-2">
          Daily practice. Real improvement. Challenge yourself—be a topper!
        </div>
        <div className="italic opacity-80 text-sm">
          "Success is the sum of small efforts, repeated day in and day out." <span className="font-bold">– Robert Collier</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 min-w-[120px] items-end">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="w-6 h-6 text-white/75" />
          <span>Quiz Your Skills</span>
        </div>
        <div className="flex items-center gap-2 text-base">
          <Star className="w-5 h-5 text-amber-200" />
          <span>Streaks &amp; Rewards</span>
        </div>
        <div className="flex items-center gap-2 text-base">
          <Users className="w-5 h-5 text-white/80" />
          <span>Compete with friends</span>
        </div>
      </div>
    </section>
  );
};
