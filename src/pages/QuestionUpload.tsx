
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const subjectsByClass: Record<number, string[]> = {
  1: ["Math", "English", "Science"],
  2: ["Math", "English", "Science"],
  3: ["Math", "English", "Science", "Social Studies"],
  4: ["Math", "English", "Science", "Social Studies"],
  5: ["Math", "English", "Science", "Social Studies", "Computer"],
  6: ["Math", "English", "Science", "Social Studies", "Computer"],
  7: ["Math", "English", "Science", "Social Studies", "Computer"],
  8: ["Math", "English", "Science", "Social Studies", "Computer"],
  9: ["Math", "English", "Science", "Social Studies", "Computer"],
  10: ["Math", "English", "Science", "Social Studies", "Computer"],
  11: ["Physics", "Chemistry", "Math", "Biology", "Accountancy", "Economics", "Business Studies", "History", "Polity", "Psychology"],
  12: ["Physics", "Chemistry", "Math", "Biology", "Accountancy", "Economics", "Business Studies", "History", "Polity", "Psychology"],
};

const streamOptions = [
  "PCM", "PCB", "Commerce", "Humanities"
];
const classOptions = Array.from({ length: 12 }, (_, i) => (i + 1));
const defaultQuestions = () => Array(5).fill(0).map(() => ({
  question: "",
  choices: ["", "", "", ""],
  correct_index: 0
}));

const QuestionUploadPage = () => {
  const [grade, setGrade] = useState(6);
  const [subject, setSubject] = useState(subjectsByClass[6][0]);
  const [stream, setStream] = useState<string | null>(null);
  const [questions, setQuestions] = useState(defaultQuestions());
  const [submissionDeadline, setSubmissionDeadline] = useState<string>("");
  const [timerSec, setTimerSec] = useState<number>(60);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    setSubject(subjectsByClass[grade][0]);
    if (grade < 11) setStream(null);
    if (grade >= 11 && !stream) setStream("PCM");
  }, [grade]);

  const handleChange = (qIdx: number, field: string, value: any) => {
    setQuestions(prev =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, [field]: value } : q
      )
    );
  };

  const setChoice = (qIdx: number, cIdx: number, value: string) => {
    setQuestions(prev =>
      prev.map((q, i) => i === qIdx
        ? {
            ...q,
            choices: q.choices.map((ch, j) => (j === cIdx ? value : ch)),
          }
        : q
      )
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;
      if (!userId) {
        alert("Could not get your user ID.");
        setLoading(false);
        return;
      }

      for (const q of questions) {
        await supabase.from("study_questions").insert({
          author_id: userId,
          grade,
          subject,
          stream: grade >= 11 ? stream : null,
          question: q.question,
          choices: q.choices,
          correct_index: q.correct_index,
          submission_deadline: submissionDeadline ? new Date(submissionDeadline).toISOString() : null,
          time_limit_sec: timerSec > 0 ? timerSec : null,
        });
      }
      alert("Questions uploaded!");
      setQuestions(defaultQuestions());
      navigate("/admin"); // Return to admin panel after successful upload
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert("Error uploading questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold mb-4 text-center">Upload 5 Daily Questions</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block font-bold mb-1">Class:</label>
            <select
              value={grade}
              onChange={e => setGrade(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {classOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {grade >= 11 && (
            <div>
              <label className="block font-bold mb-1">Stream:</label>
              <select
                value={stream || ""}
                onChange={e => setStream(e.target.value)}
                className="border rounded px-2 py-1"
              >
                {streamOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block font-bold mb-1">Subject:</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="border rounded px-2 py-1">
              {subjectsByClass[grade].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">Submission Deadline:</label>
            <input
              type="datetime-local"
              value={submissionDeadline}
              onChange={e => setSubmissionDeadline(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Time per Question (sec):</label>
            <input
              type="number"
              min={10}
              max={600}
              value={timerSec}
              onChange={e => setTimerSec(Number(e.target.value))}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="border rounded-md p-4 mt-2">
            <label className="block mb-2 font-semibold">
              Q{qIdx + 1}:
              <input
                type="text"
                value={q.question}
                onChange={e => handleChange(qIdx, "question", e.target.value)}
                placeholder="Question"
                className="border-b border-gray-300 w-full mt-1"
              />
            </label>
            <div className="flex space-x-2 mt-2">
              {q.choices.map((choice, cIdx) => (
                <input
                  key={cIdx}
                  type="text"
                  value={choice}
                  placeholder={`Option ${cIdx + 1}`}
                  onChange={e => setChoice(qIdx, cIdx, e.target.value)}
                  className="border px-2 py-1 w-1/4"
                />
              ))}
            </div>
            <div className="mt-2">
              <label className="mr-2">Correct Option:</label>
              <select
                value={q.correct_index}
                onChange={e => handleChange(qIdx, "correct_index", Number(e.target.value))}
                className="border rounded px-2 py-1"
              >
                {q.choices.map((_, i) => (
                  <option key={i} value={i}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        <div className="flex gap-2 mt-4 justify-end">
          <Button variant="secondary" onClick={() => navigate("/admin")} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionUploadPage;
