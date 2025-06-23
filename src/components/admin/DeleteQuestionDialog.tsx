
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: any;
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

export function DeleteQuestionDialog({
  open,
  onOpenChange,
  question,
  onSuccess,
  onCancel,
}: DeleteQuestionDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!question) return;
    setLoading(true);
    const { error } = await supabase.from("study_questions").delete().eq("id", question.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to delete question: " + error.message);
    } else {
      onSuccess(question.id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this question?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the selected question. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

