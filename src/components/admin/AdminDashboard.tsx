
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const AdminDashboard: React.FC<{
  totalQuestions?: number;
  totalMaterials?: number;
  totalExpired?: number;
  storyStats?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}> = ({ totalQuestions, totalMaterials, totalExpired, storyStats }) => (
  <div className={`grid gap-6 grid-cols-1 md:grid-cols-${storyStats ? "4" : "3"}`}>
    <Card>
      <CardHeader>
        <CardTitle>Total Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{totalQuestions ?? "-"}</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Study Materials</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{totalMaterials ?? "-"}</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Expired Quizzes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{totalExpired ?? "-"}</div>
      </CardContent>
    </Card>
    {storyStats && (
      <Card>
        <CardHeader>
          <CardTitle>Stories (Pending/Approved/Rejected/Total)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1 flex flex-wrap gap-2">
            <span className="text-yellow-600">{storyStats.pending}</span>
            <span className="text-green-600">/ {storyStats.approved}</span>
            <span className="text-red-600">/ {storyStats.rejected}</span>
            <span className="text-blue-800">/ {storyStats.total}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Pending / Approved / Rejected / Total
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);
