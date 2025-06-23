
import React from "react";
import { Button } from "@/components/ui/button";
import { TestSubmission } from "./types";

interface Props {
  submissionResult: TestSubmission;
  onBack: () => void;
}
export const TestResultView: React.FC<Props> = ({ submissionResult, onBack }) => (
  <div className="max-w-xl mx-auto my-6 text-center">
    <h2 className="text-xl font-semibold mb-2">Your Test Result</h2>
    <div className="border rounded p-4 bg-secondary flex flex-col items-center">
      <div className="mb-2 text-lg">
        Score: <span className="font-bold text-xl">{submissionResult.total_score}</span>
      </div>
      <div>
        Correct: <span className="font-bold text-green-600">{submissionResult.correct_count}</span>
        &nbsp;| Incorrect: <span className="font-bold text-red-600">{submissionResult.incorrect_count}</span>
      </div>
    </div>
    <Button className="mt-4" onClick={onBack}>
      Back to Tests
    </Button>
  </div>
);
