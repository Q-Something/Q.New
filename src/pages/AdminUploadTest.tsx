import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const streams = ["PCM", "PCB", "COMMERCE", "HUMANITIES"];

type TestQuestionDraft = {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
};

const initialQ = (): TestQuestionDraft => ({
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "A"
});

const AdminUploadTest: React.FC = () => {
  const [title, setTitle] = useState("");
  const [totalTime, setTotalTime] = useState(60);
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("");
  const [grade, setGrade] = useState("11");
  const [stream, setStream] = useState(streams[0]);
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState<TestQuestionDraft[]>([initialQ()]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const addQuestion = () => setQuestions(qs => [...qs, initialQ()]);
  const removeQuestion = (i: number) => setQuestions(qs => qs.length === 1 ? qs : qs.filter((_, idx) => idx !== i));
  const editQ = (i: number, k: keyof TestQuestionDraft, v: string) =>
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [k]: v } : q));

  const isValidDate = (date: string, time: string) => {
    if (!date || !time) return false;
    // Combine 'YYYY-MM-DD' + 'THH:MM' and test as ISO
    const iso = `${date}T${time}`;
    const d = new Date(iso);
    return !isNaN(d.getTime()) && iso.length >= 16;
  };

  const getExpiryISO = () => {
    if (!expiryDate || !expiryTime) return "";
    return `${expiryDate}T${expiryTime}`;
  };

  const validateForm = () => {
    if (!title.trim() || !subject.trim()) {
      toast.error("Fill all test info!");
      return false;
    }
    if (!expiryDate.trim() || !expiryTime.trim()) {
      toast.error("Set expiry date AND time!");
      return false;
    }
    if (!isValidDate(expiryDate, expiryTime)) {
      toast.error("Expiry must be a valid date and time!");
      return false;
    }
    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      if (
        !q.question_text.trim() ||
        !q.option_a.trim() ||
        !q.option_b.trim() ||
        !q.option_c.trim() ||
        !q.option_d.trim() ||
        !q.correct_option
      ) {
        toast.error(`Fill all fields for Question ${idx + 1}!`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const auth = await supabase.auth.getUser();
      const userId = auth.data.user?.id;
      if (!userId) { toast.error("Not authenticated"); setLoading(false); return; }

      const { data: testRes, error: testError } = await supabase
        .from("study_tests")
        .insert({
          title,
          total_time_min: totalTime,
          expiry_at: new Date(getExpiryISO()).toISOString(),
          class: grade,
          stream,
          subject,
          created_by: userId
        })
        .select()
        .single();
      if (testError) throw testError;

      const test_id = testRes.id;
      for (const q of questions) {
        const { error: qErr } = await supabase.from("study_test_questions").insert({ ...q, test_id });
        if (qErr) throw qErr;
      }
      toast.success("Test uploaded");
      navigate("/admin");
    } catch (e: any) {
      toast.error("Could not upload test.");
    }
    setLoading(false);
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h2 className="text-2xl mb-6 font-bold text-center">Upload New Test</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="font-semibold">Title</label>
          <input className="w-full border rounded p-2 text-sm" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="font-semibold">Subject</label>
          <input className="w-full border rounded p-2 text-sm" value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div>
          <label className="font-semibold">Class</label>
          <select className="w-full border rounded p-2 text-sm" value={grade} onChange={e => setGrade(e.target.value)}>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
        </div>
        <div>
          <label className="font-semibold">Stream</label>
          <select className="w-full border rounded p-2 text-sm" value={stream} onChange={e => setStream(e.target.value)}>
            {streams.map(s => <option value={s} key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="font-semibold">Total Time (minutes)</label>
          <input type="number" min={10} max={180} className="w-full border rounded p-2 text-sm" value={totalTime} onChange={e => setTotalTime(Number(e.target.value))} />
        </div>
        <div>
          <label className="font-semibold">Expiry</label>
          <div className="flex gap-2">
            <input
              type="date"
              className="w-1/2 border rounded p-2 text-sm"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              required
            />
            <input
              type="time"
              className="w-1/2 border rounded p-2 text-sm"
              value={expiryTime}
              onChange={e => setExpiryTime(e.target.value)}
              required
            />
          </div>
          <small className="text-muted-foreground mt-1 block">Set both date and time</small>
        </div>
      </div>
      <div>
        <label className="font-semibold block mb-1">Questions</label>
        {questions.map((q, i) => (
          <div className="border rounded p-3 mb-3" key={i}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Q{i + 1}.</span>
              <Button size="sm" variant="ghost" onClick={() => removeQuestion(i)} disabled={questions.length === 1}>Remove</Button>
            </div>
            <input
              className="w-full border rounded p-2 mb-2 text-sm"
              value={q.question_text}
              onChange={e => editQ(i, "question_text", e.target.value)}
              placeholder="Enter question"
            />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input className="border rounded p-2 text-sm" placeholder="Option A" value={q.option_a} onChange={e => editQ(i, "option_a", e.target.value)} />
              <input className="border rounded p-2 text-sm" placeholder="Option B" value={q.option_b} onChange={e => editQ(i, "option_b", e.target.value)} />
              <input className="border rounded p-2 text-sm" placeholder="Option C" value={q.option_c} onChange={e => editQ(i, "option_c", e.target.value)} />
              <input className="border rounded p-2 text-sm" placeholder="Option D" value={q.option_d} onChange={e => editQ(i, "option_d", e.target.value)} />
            </div>
            <div>
              <label>Correct Option:&nbsp;</label>
              <select className="border rounded p-1 text-sm" value={q.correct_option} onChange={e => editQ(i, "correct_option", e.target.value as TestQuestionDraft["correct_option"])}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={addQuestion} className="mt-2">Add Question</Button>
      </div>
      <div className="flex gap-2 mt-4 justify-end">
        <Button variant="secondary" onClick={() => navigate("/admin")} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Uploading..." : "Upload Test"}
        </Button>
      </div>
    </div>
  );
};
export default AdminUploadTest;
