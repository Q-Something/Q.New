
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminGetTBHQuestions, adminDeleteTBHQuestion } from "@/lib/api/tbh-api";
import { TBHQuestionForm } from "./TBHQuestionForm";
import { TBHAnswersReview } from "./TBHAnswersReview";
import { toast } from "sonner";

type TBHQuestion = {
  id: string;
  question: string;
  start_at: string;
  end_at: string;
  status: string;
  best_answer_id?: string | null;
};

export const TBHAdminPanel: React.FC = () => {
  const [tab, setTab] = useState<"create" | "active" | "expired" | "view">("active");
  const [refresh, setRefresh] = useState(0);
  const [questions, setQuestions] = useState<TBHQuestion[]>([]);
  const [selected, setSelected] = useState<TBHQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    adminGetTBHQuestions(undefined)
      .then(qs => setQuestions(qs || []))
      .finally(() => setLoading(false));
  }, [refresh]);

  function refreshList() { setRefresh(r => r + 1); setSelected(null); }

  function currentTabQuestions() {
    if (tab === "active") return questions.filter(q => q.status === "live");
    if (tab === "expired") return questions.filter(q => q.status === "expired");
    return [];
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>TBH! Management</CardTitle>
        <div className="flex gap-3 mt-3 flex-wrap">
          <Button size="sm" variant={tab === "active" ? "default" : "outline"} onClick={() => { setTab("active"); setSelected(null); }}>Active</Button>
          <Button size="sm" variant={tab === "expired" ? "default" : "outline"} onClick={() => { setTab("expired"); setSelected(null); }}>Expired</Button>
          <Button size="sm" variant={tab === "create" ? "default" : "outline"} onClick={() => { setTab("create"); setSelected(null); }}>Create New</Button>
        </div>
      </CardHeader>
      <CardContent>
        {tab === "create" && <div>
          <TBHQuestionForm onCreated={refreshList} />
        </div>}

        {(tab === "active" || tab === "expired") && (
          <div>
            {loading && <div className="text-muted-foreground py-2">Loading...</div>}
            {!loading && !currentTabQuestions().length && <div className="text-muted-foreground py-2">No TBH questions yet.</div>}
            {!loading && !!currentTabQuestions().length && (
              <div className="space-y-2">
                {currentTabQuestions().map(q => (
                  <div key={q.id} className="border rounded px-4 py-3 flex items-center gap-3 justify-between bg-white">
                    <div>
                      <div className="font-medium">{q.question}</div>
                      <div className="text-xs text-muted-foreground">
                        {q.status} &middot; {q.start_at?.slice(0, 16).replace("T", " ")} to {q.end_at?.slice(0,16).replace("T", " ")}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(q)}
                        disabled={!!deleteLoadingId}
                      >View Answers</Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deleteLoadingId === q.id}
                        onClick={async () => {
                          setDeleteLoadingId(q.id);
                          try {
                            await adminDeleteTBHQuestion(q.id);
                            toast.success("TBH deleted!");
                            refreshList();
                          } catch (err: any) {
                            toast.error("Failed to delete TBH: " + (err?.message || "Unknown error. Are you an admin user?"));
                            // log error for debugging RLS problems
                            console.error("TBH DELETE failed", err);
                          } finally {
                            setDeleteLoadingId(null);
                          }
                        }}
                      >
                        {deleteLoadingId === q.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selected && (
              <div className="mt-4">
                <div className="font-semibold mb-3 text-lg">Answers for: <span className="text-primary">&ldquo;{selected.question}&rdquo;</span></div>
                <TBHAnswersReview
                  questionId={selected.id}
                  bestAnswerId={selected.best_answer_id}
                  onSetBest={refreshList}
                />
                <Button className="mt-5" variant="secondary" size="sm" onClick={() => setSelected(null)}>Back to list</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
