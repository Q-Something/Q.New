
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Book, FileText, HelpCircle, Search } from "lucide-react";

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

  // Passes contentType to the parent, along with the form info
  const doSubmit = (contentType: 'notes' | 'answer' | 'questions' | 'explain') => {
    onSubmit({ prompt, grade, subject, bookName, exam, contentType });
  };

  return (
    <div>
      <div>
        <label className="text-sm font-medium mb-1 block">Topic or Question</label>
        <Textarea
          placeholder="Enter your topic or question here, e.g., 'Photosynthesis process', 'How to solve quadratic equations'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="h-24"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 mt-4">
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Book (Optional)</label>
          <Input
            placeholder="Enter book name"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
          />
        </div>
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
      <div className="flex flex-wrap gap-3 justify-center pt-4">
        <Button
          onClick={() => doSubmit('notes')}
          disabled={isLoading}
          className="min-w-32"
        >
          <FileText className="mr-2 h-4 w-4" />
          Generate Notes
        </Button>
        <Button
          onClick={() => doSubmit('answer')}
          disabled={isLoading}
          className="min-w-32"
        >
          <Search className="mr-2 h-4 w-4" />
          Answer Question
        </Button>
        <Button
          onClick={() => doSubmit('questions')}
          disabled={isLoading}
          className="min-w-32"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Generate Questions
        </Button>
        <Button
          onClick={() => doSubmit('explain')}
          disabled={isLoading}
          className="min-w-32"
        >
          <Book className="mr-2 h-4 w-4" />
          Explain Concept
        </Button>
      </div>
    </div>
  );
}
