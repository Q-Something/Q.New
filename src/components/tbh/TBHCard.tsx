import React, { useEffect, useState } from "react";
import { getActiveOrScheduledTBH, submitTBHAnswer, getBestTBHAnswer } from "@/lib/api/tbh-api";
import { useAuth } from "@/lib/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Cloud, PenLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TBHQuestion {
  id: string;
  question: string;
  start_at: string;
  end_at: string;
  status: string;
  best_answer_id?: string | null;
}

interface TBHAnswer {
  id: string;
  answer_text: string;
  user_id: string;
  created_at: string;
  is_best: boolean;
  username?: string;
}

export function TBHCard() {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<TBHQuestion | null>(null);
  const [bestAnswer, setBestAnswer] = useState<TBHAnswer | null>(null);
  const [myAnswer, setMyAnswer] = useState<string>("");
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [scheduled, setScheduled] = useState<TBHQuestion | null>(null);
  const { user } = useAuth();

  // Fetch the current or scheduled TBH question
  useEffect(() => {
    async function fetchTBH() {
      setLoading(true);
      const data = await getActiveOrScheduledTBH();
      setQuestion(data?.question || null);
      setHasAnswered(!!data?.myAnswer);
      setMyAnswer(data?.myAnswer?.answer_text || "");
      setScheduled(data?.scheduled || null);

      // If there is a best answer, fetch and set it
      if (data?.question?.best_answer_id) {
        const best = await getBestTBHAnswer(data.question.id, data.question.best_answer_id);
        setBestAnswer(best);
      } else {
        setBestAnswer(null);
      }
      setLoading(false);
    }
    fetchTBH();
  }, []);

  // Countdown util
  function getCountdownStr(deadline: string, mode: "start" | "end" = "start") {
    const diff = new Date(deadline).getTime() - Date.now();
    if (mode === "start" ? diff < 0 : diff < 0) return mode === "start" ? "Started" : "Ended";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return `${mode === "start" ? "Starts" : "Ends"} in ${h}h ${m}m`;
    if (m > 0) return `${mode === "start" ? "Starts" : "Ends"} in ${m}m ${s}s`;
    return `${mode === "start" ? "Starts" : "Ends"} in ${s}s`;
  }

  // Submit answer handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !myAnswer.trim()) return;
    setAnswerLoading(true);
    try {
      await submitTBHAnswer(question!.id, myAnswer.trim());
      toast.success("Answer submitted!");
      setHasAnswered(true);
    } catch (err: any) {
      toast.error("Failed to submit answer");
    } finally {
      setAnswerLoading(false);
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto rounded-3xl p-8 bg-white/70 dark:bg-background/[.95] shadow-xl ring-2 ring-qlearn-blue/10 mt-6 animate-pulse flex flex-col items-center text-center">
        <div className="h-8 w-32 bg-slate-200 rounded mb-2" />
        <div className="h-5 w-80 rounded bg-slate-100 animate-pulse" />
      </div>
    );
  }

  // PRIORITY: Show "ACTIVE TBH" if question is present and current time is in its active window
  const now = Date.now();
  if (question && new Date(question.start_at).getTime() <= now && new Date(question.end_at).getTime() > now) {
    // TBH is live/active!
    const ended = now > new Date(question.end_at).getTime();
    return (
      <div
        className="
          w-full max-w-2xl mx-auto rounded-[2.5rem] p-8 relative
          bg-gradient-to-br from-blue-50/80 via-white/95 to-purple-50/80
          dark:from-qlearn-blue/30 dark:via-background dark:to-qlearn-purple/40
          shadow-xl mt-8 border-2 border-primary/10 overflow-hidden
          transition-transform duration-200 hover:scale-105 animate-fade-in
          group
        "
      >
        {/* Thought bubble illustration in background */}
        <div className="absolute left-[-3rem] top-[-2.2rem] opacity-20 -z-10 animate-pulse pointer-events-none">
          <Cloud size={110} strokeWidth={1.3} className="text-blue-200 dark:text-emerald-900/60" />
        </div>

        {/* Animated floating dots below bubble */}
        <div className="absolute left-[10%] top-[93%] flex flex-row gap-1 pointer-events-none z-0">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-100 animate-bounce [animation-delay:0.09s]" />
          <div className="w-3 h-3 rounded-full bg-purple-100 animate-bounce [animation-delay:0.4s]" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-4xl" role="img" aria-label="thought">💭</span>
          <h3 className="font-extrabold text-3xl tracking-tight text-qlearn-blue drop-shadow">TBH!</h3>
          <span className="ml-auto text-xs font-semibold uppercase tracking-widest rounded bg-qlearn-purple/10 px-2 py-1 text-qlearn-purple">{ended ? "Closed" : "New"}</span>
        </div>
        <div className="my-4 text-xl font-semibold text-qlearn-purple/90 italic flex items-center justify-center text-center max-w-xl mx-auto min-h-[42px]">
          {question.question}
        </div>
        <div className="mb-4 text-xs text-muted-foreground">
          {ended
            ? "Ended"
            : (
              <span>
                Ends&nbsp;{getCountdownStr(question.end_at, "end")?.replace(/^Starts/, "in")}
              </span>
            )}
        </div>
        {/* Answer input for current user */}
        {!ended && user ? (
          <form className="flex flex-col sm:flex-row gap-2 items-center" onSubmit={handleSubmit}>
            <Input
              maxLength={300}
              value={myAnswer}
              disabled={hasAnswered}
              onChange={(e) => setMyAnswer(e.target.value)}
              placeholder="Type your honest answer here…"
              className="flex-1 text-lg bg-white/60 dark:bg-background/80 border-2 border-blue-100/50 focus:border-qlearn-blue"
            />
            <Button
              type="submit"
              disabled={hasAnswered || answerLoading || !myAnswer.trim()}
              className="px-6 py-2 text-lg font-bold"
            >
              <PenLine className="mr-2" size={20} />
              {hasAnswered ? "Submitted" : "Submit"}
            </Button>
          </form>
        ) : null}
        {!ended && !user && (
          <div className="text-muted-foreground mt-2 text-base">
            <a href="/auth" className="underline font-medium hover:text-primary transition-colors">Login</a> to submit your honest answer!
          </div>
        )}
        {/* After expiry, show best answer if set */}
        {ended && bestAnswer ? (
          <div className="mt-8 p-5 rounded-xl bg-yellow-100/70 border border-yellow-300 shadow-inner">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🏆</span>
              <span className="font-semibold text-qlearn-purple">Honesty of the Day</span>
            </div>
            <div className="italic text-lg">&ldquo;{bestAnswer.answer_text}&rdquo;</div>
            <div className="text-muted-foreground mt-1 text-xs">
              — @{bestAnswer.username || "anonymous"}
            </div>
          </div>
        ) : null}
        {ended && !bestAnswer && (
          <div className="mt-4 text-muted-foreground text-base">Waiting for “Honesty of the Day”.</div>
        )}
      </div>
    );
  }

  // Scheduled TBH? (future up next)
  if (!question && scheduled) {
    return (
      <div className="w-full max-w-2xl mx-auto px-0 py-10 mt-10 mb-4 flex flex-col items-center justify-center relative select-none transition-all">
        <div
          className="
            relative z-10 mx-auto
            w-full max-w-2xl
            flex flex-col items-center
            pt-8 pb-9 px-5
            rounded-[2.5rem]
            shadow-md shadow-blue-100/30 border-2 border-blue-200/40
            bg-white
            dark:bg-background
            transition-transform duration-200
            hover:scale-105
            group
          "
          style={{ minHeight: "250px" }}
        >
          <div className="flex flex-row items-center justify-center gap-2 mb-1">
            <span className="text-5xl drop-shadow animate-pulse" role="img" aria-label="thought">💭</span>
            <h3 className="font-extrabold text-3xl drop-shadow flex items-center justify-center gap-2 text-qlearn-blue">
              TBH!
            </h3>
          </div>
          <div className="text-lg font-medium text-qlearn-purple mt-2">
            <span className="font-semibold">Coming Soon!</span>
          </div>
          <div className="mt-3 text-base text-qlearn-purple/80 italic font-semibold px-4 text-center animate-fade-in">
            &ldquo;{scheduled.question}&rdquo;
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {getCountdownStr(scheduled.start_at, "start")}
          </div>
        </div>
      </div>
    );
  }

  // No active or scheduled TBH at all
  return (
    <div className="w-full max-w-2xl mx-auto rounded-[2.5rem] p-8 bg-gradient-to-bl from-yellow-100 via-white to-purple-50 dark:from-emerald-900/30 dark:via-background dark:to-violet-900/40 shadow-xl text-center mt-8 relative overflow-hidden flex flex-col items-center">
      <div className="absolute -left-7 -top-10 opacity-20 text-yellow-500 animate-[pulse_2s_infinite]">
        <Cloud size={80} />
      </div>
      <h3 className="font-extrabold text-3xl mb-1 flex items-center justify-center gap-2 text-qlearn-blue">
        <span className="drop-shadow">{'💭 TBH!'}</span>
      </h3>
      <div className="text-lg font-medium text-qlearn-purple">
        No TBH question right now. Check back soon!
      </div>
    </div>
  );
}
