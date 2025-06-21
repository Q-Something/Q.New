import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Book,
  FileText,
  HelpCircle,
  Search,
} from "lucide-react";

interface QAiPromptFormProps {
  isLoading: boolean;
  onSubmit: (options: {
    prompt: string;
    grade?: string;
    subject?: string;
    bookName?: string;
    exam?: string;
    contentType: 'notes' | 'answer' | 'questions' | 'explain';
  }) => void;
}

export default function QAiPromptForm({ isLoading, onSubmit }: QAiPromptFormProps) {
  const [prompt, setPrompt] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [bookName, setBookName] = useState("");
  const [exam, setExam] = useState("");

  const doSubmit = (contentType: 'notes' | 'answer' | 'questions' | 'explain') => {
    onSubmit({ prompt, grade, subject, bookName, exam, contentType });
  };

  return (
    <div className="space-y-6">
      {/* Topic Input */}
      <div>
        <label className="text-sm font-medium mb-1 block">Topic or Question</label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., 'Photosynthesis process', 'How to solve quadratic equations'"
          className="h-24 resize-none"
        />
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grade */}
        <div>
          <label className="text-sm font-medium mb-1 block">Grade (Optional)</label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="elementary">Elementary School</SelectItem>
              <SelectItem value="middle">Middle School</SelectItem>
              <SelectItem value="high">High School</SelectItem>
              <SelectItem value="college">College/University</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div>
          <label className="text-sm font-medium mb-1 block">Subject (Optional)</label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
              <SelectItem value="biology">Biology</SelectItem>
              <SelectItem value="literature">Literature</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="computerscience">Computer Science</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Book */}
        <div>
          <label className="text-sm font-medium mb-1 block">Book (Optional)</label>
          <Input
            placeholder="Enter book name"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
          />
        </div>

        {/* Exam */}
        <div>
          <label className="text-sm font-medium mb-1 block">Exam (Optional)</label>
          <Select value={exam} onValueChange={setExam}>
            <SelectTrigger>
              <SelectValue placeholder="Select exam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="JEE">JEE</SelectItem>
              <SelectItem value="NEET">NEET</SelectItem>
              <SelectItem value="UPSC">UPSC</SelectItem>
              <SelectItem value="SAT">SAT</SelectItem>
              <SelectItem value="GRE">GRE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => doSubmit('notes')}
          disabled={isLoading}
        >
          <FileText className="mr-2 h-4 w-4" />
          Notes
        </Button>
        <Button
          variant="outline"
          onClick={() => doSubmit('answer')}
          disabled={isLoading}
        >
          <Search className="mr-2 h-4 w-4" />
          Answer
        </Button>
        <Button
          variant="outline"
          onClick={() => doSubmit('questions')}
          disabled={isLoading}
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Questions
        </Button>
        <Button
          variant="outline"
          onClick={() => doSubmit('explain')}
          disabled={isLoading}
        >
          <Book className="mr-2 h-4 w-4" />
          Explain
        </Button>
      </div>
    </div>
  );
}
