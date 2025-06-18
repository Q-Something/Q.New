import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Flame, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DailyStreakCollector } from "@/components/streak/DailyStreakCollector";

// Replace contents with new streak collector
const DailyStreakPage = () => {
  return (
    <div className="container py-8 px-4 max-w-2xl mx-auto">
      <DailyStreakCollector />
    </div>
  );
};

export default DailyStreakPage;
