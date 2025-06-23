
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { EditQuestionDialog } from "./EditQuestionDialog";
import { DeleteQuestionDialog } from "./DeleteQuestionDialog";
import { QuestionsFilters } from "./QuestionsFilters";
import { QuestionsTable } from "./QuestionsTable";

type TestWithQuestions = {
  id: string;
  title: string;
  total_time_min: number;
  expiry_at: string;
  class: string;
  stream: string;
  subject: string;
  created_by: string;
  created_at?: string;
  questions: TestQ[];
};

type TestQ = {
  id: string;
  test_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  created_at?: string;
}

export const AdminQuestionsPanel: React.FC = () => {
  const [tests, setTests] = useState<TestWithQuestions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTestId, setEditTestId] = useState<string | null>(null);
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState<TestQ | null>(null);
  const [deleteQuestion, setDeleteQuestion] = useState<TestQ | null>(null);
  const [deletingOld, setDeletingOld] = useState(false);
  const navigate = useNavigate();

  // Fetch tests and their questions
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    let mounted = true;
    async function loadData() {
      // 1. Get all tests, ordered latest first
      const { data: testData, error: errTests } = await supabase
        .from("study_tests")
        .select("*")
        .order("created_at", { ascending: false });
      if (errTests) {
        if (mounted) {
          setError("Error loading tests: " + errTests.message);
          setIsLoading(false);
        }
        return;
      }
      // 2. Get questions for these tests
      const testIds = testData.map((t: any) => t.id);
      let testQuestions: TestQ[] = [];
      if (testIds.length > 0) {
        const { data: questionsData, error: errQs } = await supabase
          .from("study_test_questions")
          .select("*")
          .in("test_id", testIds);
        if (errQs) {
          if (mounted) {
            setError("Error loading questions: " + errQs.message);
            setIsLoading(false);
          }
          return;
        }
        testQuestions = questionsData as TestQ[];
      }
      // 3. Join tests and their questions
      const testsWithQs: TestWithQuestions[] = testData.map((t: any) => ({
        ...t,
        questions: testQuestions.filter(q => q.test_id === t.id),
      }));
      if (mounted) {
        setTests(testsWithQs);
        setIsLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; }
  }, []);

  // Delete ALL old Q.Study questions (from study_questions table)
  const handleDeleteOldData = async () => {
    if (!window.confirm("Are you sure you want to delete ALL old question data? This cannot be undone.")) return;
    setDeletingOld(true);
    const { error } = await supabase.from("study_questions").delete().neq("id", ""); // delete all
    setDeletingOld(false);
    if (error) {
      toast.error("Error deleting old data: " + error.message);
    } else {
      toast.success("All old questions deleted.");
    }
  };

  // Delete entire Test by testId
  const handleDeleteTest = async (testId: string) => {
    if (!window.confirm("Delete this entire Test (and all questions inside)?")) return;
    const { error } = await supabase.from("study_tests").delete().eq("id", testId);
    if (error) {
      toast.error("Error deleting test: " + error.message);
    } else {
      setTests(prev => prev.filter(t => t.id !== testId));
      toast.success("Test deleted.");
    }
  };

  // Delete a single Test Question by questionId
  const handleDeleteQuestion = async (testId: string, questionId: string) => {
    if (!window.confirm("Delete this question from the Test?")) return;
    const { error } = await supabase.from("study_test_questions").delete().eq("id", questionId);
    if (error) {
      toast.error("Error deleting question: " + error.message);
    } else {
      setTests(prev => prev.map(t =>
        t.id === testId
          ? { ...t, questions: t.questions.filter(q => q.id !== questionId) }
          : t
      ));
      toast.success("Question deleted.");
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-3 mb-4">
        <div className="flex gap-2 flex-1 md:justify-start">
          <Button variant="destructive" size="sm" onClick={handleDeleteOldData} disabled={deletingOld}>
            {deletingOld ? "Deleting Old Data..." : "Delete All Old Data"}
          </Button>
        </div>
        <div className="flex gap-2 flex-1 md:justify-end">
          <Button variant="default" size="sm" onClick={() => navigate("/admin/upload-test")}>Upload Test</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : error ? (
        <div className="text-destructive text-center">{error}</div>
      ) : tests.length === 0 ? (
        <div className="py-12 text-muted-foreground text-center">No Test data found. Please upload a new test.</div>
      ) : (
        <div className="space-y-8">
          {tests.map(test => (
            <Card key={test.id}>
              <CardHeader className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3">
                <div>
                  <CardTitle>
                    {test.title}
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Class {test.class} / {test.stream}) &middot; {test.subject}
                    </span>
                  </CardTitle>
                  <div className="text-xs mt-2">
                    Total Time: <b>{test.total_time_min} min</b>
                    &nbsp;|&nbsp;
                    Expiry: <b>{new Date(test.expiry_at).toLocaleString()}</b>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 md:mt-0">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/admin/upload-test?edit=${test.id}`)}>
                    Edit Test
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteTest(test.id)}>
                    Delete Test
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {test.questions.length === 0 ? (
                  <div className="italic text-muted-foreground text-xs pb-4">No questions for this test.</div>
                ) : (
                  <table className="w-full table-auto border mt-2">
                    <thead>
                      <tr className="bg-muted text-xs">
                        <th className="px-2 py-1 text-left">#</th>
                        <th className="px-2 py-1 text-left w-3/6">Question</th>
                        <th className="px-2 py-1 text-left">A</th>
                        <th className="px-2 py-1 text-left">B</th>
                        <th className="px-2 py-1 text-left">C</th>
                        <th className="px-2 py-1 text-left">D</th>
                        <th className="px-2 py-1 text-left">Correct</th>
                        <th className="px-2 py-1 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {test.questions.map((q, idx) => (
                        <tr key={q.id} className="border-t">
                          <td className="px-2 py-1">{idx + 1}</td>
                          <td className="px-2 py-1">{q.question_text}</td>
                          <td className="px-2 py-1">{q.option_a}</td>
                          <td className="px-2 py-1">{q.option_b}</td>
                          <td className="px-2 py-1">{q.option_c}</td>
                          <td className="px-2 py-1">{q.option_d}</td>
                          <td className="px-2 py-1 font-semibold text-green-600">{q.correct_option}</td>
                          <td className="px-2 py-1 text-center">
                            <Button variant="outline" size="sm" className="mr-1"
                              onClick={() => setEditQuestion(q)}>
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm"
                              onClick={() => handleDeleteQuestion(test.id, q.id)}>
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Edit dialog for question (reuses EditQuestionDialog, you can enhance as needed) */}
      <EditQuestionDialog
        open={!!editQuestion}
        onOpenChange={open => !open && setEditQuestion(null)}
        question={editQuestion as any}
        onSuccess={updatedQ => {
          // Update UI with edited question
          setTests(prevTests =>
            prevTests.map(test => test.id === updatedQ.test_id
              ? {
                  ...test,
                  questions: test.questions.map(q =>
                    q.id === updatedQ.id ? { ...q, ...updatedQ } : q
                  )
                }
              : test
            )
          );
          setEditQuestion(null);
          toast.success("Question updated!");
        }}
      />
      {/* Delete question dialog not used in this version; handled inline with confirm(). */}
    </div>
  );
};

