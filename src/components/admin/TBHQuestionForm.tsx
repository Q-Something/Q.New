
import React, { useState } from "react";
import { adminCreateTBHQuestion } from "@/lib/api/tbh-api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  onCreated: () => void;
};
export const TBHQuestionForm: React.FC<Props> = ({ onCreated }) => {
  const [question, setQuestion] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !startAt || !endAt) {
      toast.error("All fields required");
      return;
    }
    setLoading(true);
    try {
      await adminCreateTBHQuestion(question.trim(), startAt, endAt);
      toast.success("TBH question created!");
      setQuestion(""); setStartAt(""); setEndAt("");
      onCreated();
    } catch (e: any) {
      toast.error("Failed to create: " + (e?.message || "Error"));
    }
    setLoading(false);
  }

  return (
    <form className="space-y-3 max-w-2xl" onSubmit={handleCreate}>
      <div>
        <label className="font-medium">Question</label>
        <textarea
          className="w-full p-2 border rounded mt-1"
          required
          value={question}
          rows={2}
          onChange={e => setQuestion(e.target.value)}
          maxLength={220}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <label className="font-medium">Start Time</label>
          <input
            type="datetime-local"
            className="w-full p-2 border rounded"
            required
            value={startAt}
            onChange={e => setStartAt(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="font-medium">End Time</label>
          <input
            type="datetime-local"
            className="w-full p-2 border rounded"
            required
            value={endAt}
            onChange={e => setEndAt(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create TBH"}
      </Button>
    </form>
  );
};
