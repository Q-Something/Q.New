
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Test } from "./types";

interface Props {
  tests: Test[];
  onSelect: (testId: string) => void;
}
export const TestSelectionView: React.FC<Props> = ({ tests, onSelect }) => {
  if (!tests.length)
    return (
      <div className="py-8 text-center text-muted-foreground">
        No tests are currently available for your class and stream.
      </div>
    );
  return (
    <>
      <h2 className="text-xl font-semibold text-center mb-4">Available Tests</h2>
      <div className="space-y-4 max-w-xl mx-auto">
        {tests.map(test => (
          <Card key={test.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold text-lg">{test.title}</div>
              <div className="text-sm text-muted-foreground">
                <span>Subject: {test.subject} | Time: {test.total_time_min} min | Expires: {new Date(test.expiry_at).toLocaleString()}</span>
              </div>
            </div>
            <Button
              onClick={() => onSelect(test.id)}
              size="sm"
              variant="default"
            >
              Attempt
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
};
