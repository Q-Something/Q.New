
import React, { useEffect, useState } from "react";
import { adminGetTBHAnswers, adminSetHonestyOfTheDay } from "@/lib/api/tbh-api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  questionId: string;
  bestAnswerId?: string | null;
  onSetBest: () => void;
}
export const TBHAnswersReview: React.FC<Props> = ({ questionId, bestAnswerId, onSetBest }) => {
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [setting, setSetting] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    adminGetTBHAnswers(questionId)
      .then((data) => setAnswers(data || []))
      .finally(() => setLoading(false));
  }, [questionId, bestAnswerId]);

  async function handleSetBest(answerId: string) {
    setSetting(answerId);
    try {
      await adminSetHonestyOfTheDay(questionId, answerId);
      toast.success("Honesty of the Day picked!");
      onSetBest();
    } catch (e: any) {
      toast.error("Failed to update: " + (e?.message || "Error"));
    }
    setSetting(null);
  }

  if (loading) return <div className="text-center py-4 text-muted-foreground">Loading answers...</div>;
  if (!answers.length) return <div className="text-center py-4 text-muted-foreground">No answers submitted yet.</div>;

  return (
    <div className="space-y-3">
      {answers.map(a => (
        <div key={a.id} className={"rounded border px-4 py-3 relative " + (a.id === bestAnswerId ? "bg-yellow-100 border-yellow-400" : "bg-muted")}>
          <div className="text-base italic">{a.answer_text}</div>
          <div className="text-xs mt-1 text-gray-500">— @{a.username}</div>
          <div className="absolute top-2 right-2">
            {a.id === bestAnswerId ? (
              <span className="bg-yellow-300 text-yellow-800 px-2 py-1 rounded text-xs">Honesty of the Day</span>
            ) : (
              <Button size="sm" variant="outline" disabled={!!bestAnswerId || setting === a.id} onClick={() => handleSetBest(a.id)}>
                {setting === a.id ? "Setting..." : "Set as Honesty"}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
