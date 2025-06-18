
export type Test = {
  id: string;
  title: string;
  subject: string;
  total_time_min: number;
  expiry_at: string;
  class: string;
  stream: string;
};
export type Question = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
};
export type TestSubmission = {
  id: string;
  test_id: string;
  student_id: string;
  answers: Record<string, string>;
  correct_count: number;
  incorrect_count: number;
  total_score: number;
  student_class?: string;
  student_stream?: string;
  submitted_at?: string;
};
