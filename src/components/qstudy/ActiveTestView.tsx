
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Question } from "./types";

interface Props {
  testQuestions: Question[];
  answers: Record<string, string>;
  timerStarted: boolean;
  testTimeLeft: number;
  submitted: boolean;
  submitting: boolean;
  onSelect: (qid: string, opt: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}
export const ActiveTestView: React.FC<Props> = ({
  testQuestions,
  answers,
  timerStarted,
  testTimeLeft,
  submitted,
  submitting,
  onSelect,
  onSubmit,
  onBack,
}) => {
  const timeDisp =
    testTimeLeft > 0
      ? `${Math.floor(testTimeLeft / 60)
          .toString()
          .padStart(2, "0")}:${(testTimeLeft % 60)
          .toString()
          .padStart(2, "0")}`
      : "00:00";
  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Button size="sm" variant="outline" onClick={onBack}>
          &larr; Back
        </Button>
        <div className="text-lg font-bold">
          Remaining Time: <span className="font-mono">{timeDisp}</span>
        </div>
      </div>
      {testQuestions.map((q, idx) => (
        <Card key={q.id} className="mb-4 p-4">
          <div className="font-semibold mb-2">{`Q${idx + 1}. ${q.question_text}`}</div>
          <div className="grid grid-cols-2 gap-2">
            {(["A", "B", "C", "D"] as const).map(opt =>
              <Button
                key={opt}
                onClick={() => onSelect(q.id, opt)}
                className={`text-left`}
                variant={answers[q.id] === opt ? "default" : "outline"}
                disabled={submitted}
                size="sm"
              >
                {opt}. {q[`option_${opt.toLowerCase()}` as keyof Question]}
              </Button>
            )}
          </div>
        </Card>
      ))}
      <div className="mt-4 flex justify-center">
        <Button
          variant="default"
          onClick={onSubmit}
          disabled={Object.keys(answers).length !== testQuestions.length || submitting}
        >
          {submitting ? "Submitting..." : "Submit Test"}
        </Button>
      </div>
    </div>
  );
};
