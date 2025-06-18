import { supabase } from "@/integrations/supabase/client";

// Fetch the current live TBH question **and if none, return the next scheduled TBH**
export async function getActiveOrScheduledTBH() {
  const nowIso = new Date().toISOString();

  // Try to get active TBH first (start_at <= now < end_at)
  const { data: q, error } = await supabase
    .from("tbh_questions")
    .select("*")
    .eq("status", "live")
    .lte("start_at", nowIso)
    .gt("end_at", nowIso)
    .maybeSingle();

  if (q) {
    let myAnswer = null;
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        const { data: a } = await supabase
          .from("tbh_answers")
          .select("*")
          .eq("question_id", q.id)
          .eq("user_id", user.user.id)
          .maybeSingle();
        myAnswer = a;
      }
    } catch {/* ignore */}
    return { question: q, myAnswer, scheduled: null };
  }

  // If no active, fetch the next scheduled TBH (start_at > now)
  const { data: futureQ, error: futErr } = await supabase
    .from("tbh_questions")
    .select("*")
    .eq("status", "live")
    .gt("start_at", nowIso)
    .order("start_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (futureQ) {
    return { question: null, myAnswer: null, scheduled: futureQ };
  }
  // No TBH at all
  return { question: null, myAnswer: null, scheduled: null };
}

// Submit TBH answer
export async function submitTBHAnswer(question_id: string, answer_text: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error("Not logged in");
  // Only one answer per user per question (enforced in frontend and RLS)
  const { error, data } = await supabase
    .from("tbh_answers")
    .upsert([
      { question_id, user_id: user.user.id, answer_text }
    ], { onConflict: "question_id,user_id" });
  if (error) throw error;
  return data;
}

// Fetch best answer with username
export async function getBestTBHAnswer(question_id: string, answer_id: string) {
  // profiles is joined by user_id in tbh_answers (now FK)
  const { data: ans, error } = await supabase
    .from("tbh_answers")
    .select("*, profiles!inner(username)")
    .eq("id", answer_id)
    .maybeSingle();

  if (!ans) return null;
  return {
    ...ans,
    username: ans.profiles?.username || "anonymous",
  };
}

// --- ADMIN TBH FUNCTIONS ---

// Get all (optionally filtered) TBH questions (latest first)
export async function adminGetTBHQuestions(status?: string) {
  let q = supabase
    .from("tbh_questions")
    .select("*")
    .order("start_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

// Create TBH question
export async function adminCreateTBHQuestion(question: string, start_at: string, end_at: string) {
  const { data, error } = await supabase
    .from("tbh_questions")
    .insert([{ question, start_at, end_at, status: "live" }])
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Expire a TBH question
export async function adminExpireTBHQuestion(id: string) {
  const { data, error } = await supabase
    .from("tbh_questions")
    .update({ status: "expired" })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}

// NEW: Delete a TBH question (admin only)
export async function adminDeleteTBHQuestion(id: string) {
  try {
    const { error } = await supabase
      .from("tbh_questions")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    // Enhanced error log for debugging
    console.error("TBH DELETE failed:", err);
    throw err;
  }
}

// Fetch all answers for a TBH question with usernames
export async function adminGetTBHAnswers(question_id: string) {
  const { data, error } = await supabase
    .from("tbh_answers")
    .select("*, profiles(username)")
    .eq("question_id", question_id)
    .order("created_at")
    .returns<any[]>();
  if (error) throw error;
  return data?.map((r) => ({
    ...r,
    username: r.profiles?.username || "anonymous"
  }));
}

// Mark a TBH answer as best / Honesty of the Day
export async function adminSetHonestyOfTheDay(question_id: string, answer_id: string) {
  // 1. Mark all answers for question as not best
  await supabase.from("tbh_answers")
    .update({ is_best: false })
    .eq("question_id", question_id);

  // 2. Mark selected as best
  await supabase.from("tbh_answers")
    .update({ is_best: true })
    .eq("id", answer_id);

  // 3. Set best_answer_id in tbh_questions
  const { data, error } = await supabase
    .from("tbh_questions")
    .update({ best_answer_id: answer_id })
    .eq("id", question_id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data;
}
