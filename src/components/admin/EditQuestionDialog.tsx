import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: any;
  onSuccess: (q: any) => void;
}

const EMPTY_CHOICES = ["", "", "", ""];

export function EditQuestionDialog({
  open,
  onOpenChange,
  question,
  onSuccess,
}: EditQuestionDialogProps) {
  const [form, setForm] = useState({
    question: "",
    choices: [...EMPTY_CHOICES],
    correct_index: 0,
    subject: "",
    stream: "",
    submission_deadline: "",
    time_limit_sec: "",
    grade: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!question) return;
    setForm({
      question: question.question ?? "",
      choices: Array.isArray(question.choices) && question.choices.length === 4
        ? [...question.choices]
        : [...EMPTY_CHOICES],
      correct_index: question.correct_index ?? 0,
      subject: question.subject ?? "",
      stream: question.stream ?? "",
      submission_deadline: question.submission_deadline
        ? new Date(question.submission_deadline).toISOString().slice(0, 16)
        : "",
      time_limit_sec: question.time_limit_sec?.toString() ?? "",
      grade: question.grade?.toString() ?? "",
    });
  }, [question]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  const handleChoiceChange = (idx: number, value: string) => {
    setForm((f) => {
      const newChoices = [...f.choices];
      newChoices[idx] = value;
      return { ...f, choices: newChoices };
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.question.trim()) {
      toast.error("Question text is required.");
      return;
    }
    if (form.choices.some((c) => !c.trim())) {
      toast.error("All choices must be filled.");
      return;
    }
    if (
      isNaN(Number(form.correct_index)) ||
      Number(form.correct_index) < 0 ||
      Number(form.correct_index) >= form.choices.length
    ) {
      toast.error("Correct answer index is invalid.");
      return;
    }
    setLoading(true);
    const { error, data } = await supabase
      .from("study_questions")
      .update({
        question: form.question,
        choices: form.choices,
        correct_index: Number(form.correct_index),
        subject: form.subject,
        stream: form.stream || null,
        submission_deadline: form.submission_deadline
          ? new Date(form.submission_deadline).toISOString()
          : null,
        time_limit_sec: form.time_limit_sec
          ? Number(form.time_limit_sec)
          : null,
        grade: Number(form.grade),
      })
      .eq("id", question.id)
      .select()
      .maybeSingle();

    setLoading(false);
    if (error) {
      toast.error("Failed to update question: " + error.message);
      return;
    }
    if (data) onSuccess(data);
    onOpenChange(false);
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update details for this quiz question.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="block mb-1 font-medium">Question</label>
            <input
              className="w-full border px-2 py-1 rounded"
              name="question"
              value={form.question}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Choices</label>
            <div className="grid grid-cols-1 gap-2">
              {form.choices.map((ch, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <label className="w-6">{String.fromCharCode(65 + idx)}.</label>
                  <input
                    type="text"
                    name={`choice-${idx}`}
                    className="flex-1 border px-2 py-1 rounded"
                    value={ch}
                    onChange={(e) => handleChoiceChange(idx, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Correct Choice Index (0-3)</label>
            <input
              type="number"
              name="correct_index"
              className="border px-2 py-1 rounded w-20"
              min={0}
              max={form.choices.length - 1}
              value={form.correct_index}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Subject</label>
            <input
              className="w-full border px-2 py-1 rounded"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Stream (optional)</label>
            <input
              className="w-full border px-2 py-1 rounded"
              name="stream"
              value={form.stream}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Grade/Class</label>
            <input
              className="w-full border px-2 py-1 rounded"
              name="grade"
              type="number"
              value={form.grade}
              onChange={handleChange}
              required
              min={1}
              max={12}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Submission Deadline</label>
            <input
              type="datetime-local"
              name="submission_deadline"
              className="w-full border px-2 py-1 rounded"
              value={form.submission_deadline}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Time Limit (seconds, optional)</label>
            <input
              type="number"
              name="time_limit_sec"
              className="w-full border px-2 py-1 rounded"
              value={form.time_limit_sec}
              onChange={handleChange}
              min={0}
              placeholder="Leave empty for no limit"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              variant="default"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
