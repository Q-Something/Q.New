import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TestSelectionView } from "./TestSelectionView";
import { ActiveTestView } from "./ActiveTestView";
import { TestResultView } from "./TestResultView";
import type { Test, Question, TestSubmission } from "./types";

// Helper for DB type coercion
function mapSubmissionFromDb(dbObject: any): TestSubmission {
  let safeAnswers: Record<string, string> = {};
  if (dbObject?.answers && typeof dbObject.answers === "object" && dbObject.answers !== null && !Array.isArray(dbObject.answers)) {
    for (const k in dbObject.answers) {
      if (typeof dbObject.answers[k] === "string") {
        safeAnswers[k] = dbObject.answers[k];
      }
    }
  }
  return {
    id: dbObject.id,
    test_id: dbObject.test_id,
    student_id: dbObject.student_id,
    answers: safeAnswers,
    correct_count: dbObject.correct_count,
    incorrect_count: dbObject.incorrect_count,
    total_score: dbObject.total_score,
    student_class: dbObject.student_class,
    student_stream: dbObject.student_stream,
    submitted_at: dbObject.submitted_at,
  };
}

// Helper for safe question mapping
function mapDbQuestions(dbArr: any[]): Question[] {
  return (dbArr || []).map((q) => ({
    id: q.id,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_option: (["A", "B", "C", "D"].includes(q.correct_option) ? q.correct_option : "A") as "A" | "B" | "C" | "D",
  }));
}

function classToGrade(cls: any): string | null {
  if (typeof cls === "string") {
    if (cls.endsWith("th")) {
      const num = parseInt(cls.replace("th", ""));
      if (!isNaN(num)) return num.toString();
    }
    if (cls === "11" || cls === "12") return cls;
    return null;
  }
  if (typeof cls === "number") return cls.toString();
  return null;
}

export const StudentTestTakeView: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  // For active test taking session
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testTimeLeft, setTestTimeLeft] = useState<number>(0); // seconds
  const [timerStarted, setTimerStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<TestSubmission | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // For submit check
  const [existingSubmission, setExistingSubmission] = useState<TestSubmission | null>(null);

  // 1. Load profile + tests
  useEffect(() => {
    const fetchProfileAndTests = async () => {
      setLoading(true);
      if (!user) {
        setError("You must be logged in to see available tests.");
        setLoading(false);
        return;
      }

      // Get class/stream
      const { data: profileData, error: pError } = await supabase
        .from("profiles")
        .select("class, stream")
        .eq("id", user.id)
        .maybeSingle();
      if (pError || !profileData?.class) {
        setError("Profile incomplete. Please update your class/stream in your profile first.");
        setLoading(false);
        return;
      }
      setProfile(profileData);
      const grade = classToGrade(profileData.class);
      if (!grade) {
        setError("Invalid class value in your profile. Please update your class.");
        setLoading(false);
        return;
      }
      // Only show unexpired, matching class/stream
      let query = supabase
        .from("study_tests")
        .select("*")
        .gt("expiry_at", new Date().toISOString())
        .eq("class", grade)
        .eq("stream", profileData.stream)
        .order("expiry_at");
      const { data: testData, error: tError } = await query;
      if (tError) {
        setError("Could not load tests.");
        setLoading(false);
        return;
      }
      setTests(testData ?? []);
      setLoading(false);
    };
    fetchProfileAndTests();
  }, [user]);

  // 2. On test select = check if already submitted + load questions
  useEffect(() => {
    if (!selectedTestId || !user) return;
    const fetch = async () => {
      setLoading(true);
      // Check if already submitted
      const { data: sub, error: subErr } = await supabase
        .from("study_test_submissions")
        .select("*")
        .eq("test_id", selectedTestId)
        .eq("student_id", user.id)
        .maybeSingle();
      if (subErr) {
        setError("Could not check submission."); setLoading(false); return;
      }
      if (sub) {
        setExistingSubmission(mapSubmissionFromDb(sub));
        setLoading(false);
        return;
      }
      // Load questions
      const { data: qs, error: qsErr } = await supabase
        .from("study_test_questions")
        .select("*")
        .eq("test_id", selectedTestId)
        .order("created_at");
      if (qsErr) { setError("Could not load test questions."); setLoading(false); return; }
      setTestQuestions(mapDbQuestions(qs ?? []));
      setAnswers({});
      setTestTimeLeft(0);
      setTimerStarted(false);
      setSubmitted(false);
      setSubmissionResult(null);
      setLoading(false);
    };
    fetch();
  }, [selectedTestId, user]);

  // 3. Timer handling (once timer started)
  useEffect(() => {
    if (!timerStarted || testTimeLeft <= 0 || submitted) return;
    const interval = setInterval(() => {
      setTestTimeLeft(t => {
        if (t <= 1) {
          handleSubmit(); // auto-submit at 0
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [timerStarted, testTimeLeft, submitted]);

  // 4. Picking a test
  if (loading) return <div className="py-8 text-center">Loading...</div>;
  if (error)
    return (
      <div className="py-8 text-center text-destructive">{error}</div>
    );

  if (!user) return null;

  // Test selection (if not picked)
  if (!selectedTestId) {
    return (
      <TestSelectionView tests={tests} onSelect={setSelectedTestId} />
    );
  }

  // Already submitted view
  if (existingSubmission) {
    return (
      <div className="max-w-xl mx-auto my-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Test Already Attempted</h2>
        <div className="mb-2">You have already submitted this test.</div>
        <div className="border rounded p-4 bg-secondary">
          <div>Your Score: <span className="font-bold">{existingSubmission.total_score}</span></div>
          <div>
            Correct: <span className="font-bold text-green-600">{existingSubmission.correct_count}</span>
            &nbsp;| Incorrect: <span className="font-bold text-red-600">{existingSubmission.incorrect_count}</span>
          </div>
        </div>
        <Button className="mt-4" onClick={() => { setSelectedTestId(null); setExistingSubmission(null); }}>
          Back to Tests
        </Button>
      </div>
    );
  }

  // Test taking view
  if (!submitted && testQuestions.length) {
    // Find the test object for time
    const test = tests.find(t => t.id === selectedTestId);
    if (!timerStarted && testTimeLeft === 0 && test) {
      setTestTimeLeft(test.total_time_min * 60); // sec
      setTimerStarted(true);
    }
    return (
      <ActiveTestView
        testQuestions={testQuestions}
        answers={answers}
        timerStarted={timerStarted}
        testTimeLeft={testTimeLeft}
        submitted={submitted}
        submitting={submitting}
        onSelect={(qid, opt) => setAnswers(a => ({ ...a, [qid]: opt }))}
        onSubmit={handleSubmit}
        onBack={() => setSelectedTestId(null)}
      />
    );
  }

  // After submit: show result
  if (submitted && submissionResult) {
    return (
      <TestResultView
        submissionResult={submissionResult}
        onBack={() => window.location.reload()}
      />
    );
  }

  // Default fallback (should not hit)
  return null;

  // Submit handler
  async function handleSubmit() {
    if (submitted || !user || !selectedTestId) return;
    setSubmitting(true);
    let correct = 0, incorrect = 0;
    testQuestions.forEach(q => {
      if (!answers[q.id]) return;
      if (answers[q.id] === q.correct_option) correct++;
      else incorrect++;
    });
    // Scoring as per requirement:
    // correct: +5, incorrect: -2, skipped: 0
    const total_score = correct * 5 + incorrect * -2;

    const { data: subRes, error: subErr } = await supabase
      .from("study_test_submissions")
      .insert([{
        test_id: selectedTestId,
        student_id: user.id,
        student_class: profile?.class ?? "",
        student_stream: profile?.stream ?? "",
        answers: answers,
        total_score,
        correct_count: correct,
        incorrect_count: incorrect,
      }])
      .select()
      .maybeSingle();
    if (!subErr && subRes) {
      setSubmissionResult(mapSubmissionFromDb(subRes));
      setSubmitted(true);
    } else {
      setError("Could not submit your test. If you have already submitted, try refreshing.");
    }
    setSubmitting(false);
  }
};
