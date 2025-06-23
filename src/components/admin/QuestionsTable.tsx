
import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export type Question = {
  id: string;
  question: string;
  grade: number;
  choices: string[];
  correct_index: number;
  submission_deadline?: string | null;
  subject?: string | null;
  stream?: string | null;
  created_at?: string;
};

interface QuestionsTableProps {
  filtered: Question[];
  now: Date;
  onEdit: (q: Question) => void;
  onDelete: (q: Question) => void;
}

export function QuestionsTable({
  filtered,
  now,
  onEdit,
  onDelete,
}: QuestionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Class</TableHead>
          <TableHead>Stream</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Question</TableHead>
          <TableHead>Choices</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map(q => {
          const expired = !!q.submission_deadline && new Date(q.submission_deadline) < now;
          return (
            <TableRow key={q.id}>
              <TableCell>{q.grade}</TableCell>
              <TableCell>{q.stream ?? <span className="text-muted-foreground italic">—</span>}</TableCell>
              <TableCell>{q.subject ?? <span className="text-muted-foreground italic">—</span>}</TableCell>
              <TableCell>
                <span title={q.question}>
                  {q.question.length > 70 ? q.question.slice(0, 70) + "..." : q.question}
                </span>
              </TableCell>
              <TableCell>
                <ol className="list-decimal ml-4">
                  {q.choices.map((ch, idx) => (
                    <li key={idx} className={idx === q.correct_index ? "font-semibold text-green-600" : ""}>
                      {ch}
                    </li>
                  ))}
                </ol>
              </TableCell>
              <TableCell>
                {expired ? (
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">Expired</span>
                ) : (
                  <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">
                    Active
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Edit"
                    onClick={() => onEdit(q)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    aria-label="Delete"
                    onClick={() => onDelete(q)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {filtered.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              No questions found for filter.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
