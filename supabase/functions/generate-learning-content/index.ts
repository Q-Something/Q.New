
// Replace Gemini with OpenRouter for all content generation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// OpenRouter key is now hardcoded as per your request.
const openRouterApiKey = "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";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestParams {
  prompt: string;
  contentType: 'notes' | 'answer' | 'questions' | 'explain';
  grade?: string;
  bookName?: string;
  exam?: string;
  subject?: string;
}

// Simple rate limiting using memory cache
const requestCache = new Map<string, { timestamp: number, count: number }>();
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS_PER_WINDOW = 3;
function isRateLimited(identifier: string) {
  const now = Date.now();
  const cached = requestCache.get(identifier);
  if (!cached) {
    requestCache.set(identifier, { timestamp: now, count: 1 });
    return false;
  }
  if (now - cached.timestamp > RATE_LIMIT_WINDOW) {
    requestCache.set(identifier, { timestamp: now, count: 1 });
    return false;
  }
  if (cached.count >= MAX_REQUESTS_PER_WINDOW) return true;
  cached.count += 1;
  requestCache.set(identifier, cached);
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    let params: RequestParams;
    try {
      params = await req.json() as RequestParams;
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { prompt, contentType, grade, bookName, exam, subject } = params;

    if (!prompt || !contentType) {
      return new Response(JSON.stringify({ error: 'Prompt and content type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const requestIdentifier = `${contentType}_${prompt.substring(0, 10)}`;
    if (isRateLimited(requestIdentifier)) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          content: "You've made too many requests recently. Please wait a minute before trying again.",
          contentType,
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // System context is optimized for Markdown+LaTeX (math, physics) output
    let systemContext = `You are a helpful educational AI built for the Q.Something app (made by some smart teens). 
Always respond in clearly structured Markdown with relevant LaTeX syntax for all mathematical, physics, and chemistry equations.
Use section headings (#, ##, ###), bullet points, bold, italics, and highlight key points.
- For any formula, use LaTeX inside $...$ (inline) or $$...$$ (block). 
- Present answers for mathematics or physics using correct math symbols.
Only output Markdown, do NOT include any text explaining that you are an AI or who made you, except if the user directly asks who made you (reply: "Some smart teens made me for Q.Something").`;

    // Enhance prompt per type
    switch (contentType) {
      case 'notes':
        systemContext += " You create comprehensive study notes with sections, bullet points, important formulas, and definitions. Use mathematical notation and heading hierarchy.";
        break;
      case 'answer':
        systemContext += " You provide detailed answers, breaking down reasoning step-by-step. Use proper math/physics notation where necessary.";
        break;
      case 'questions':
        systemContext += " You generate assorted practice questions (MCQs, short/essay), each with answers and explanations, and output everything in well-organized Markdown. Show formulas in LaTeX.";
        break;
      case 'explain':
        systemContext += " You explain concepts in simple terms for beginners, with analogies, simple math symbols, and visual descriptions. Use Markdown and LaTeX as needed.";
        break;
    }

    let contextualPrompt = prompt;
    if (grade) {
      contextualPrompt += ` [Grade level: ${grade}]`;
      systemContext += ` Tailor the response for grade ${grade}.`;
    }
    if (bookName) {
      contextualPrompt += ` [Book: "${bookName}"]`;
      systemContext += ` If possible, relate your answer to content found in the textbook "${bookName}".`;
    }
    if (exam) {
      contextualPrompt += ` [Exam: ${exam} preparation]`;
      systemContext += ` Focus on what is relevant for ${exam} exam.`;
    }
    if (subject) {
      contextualPrompt += ` [Subject: ${subject}]`;
      systemContext += ` Provide subject-specific notation and explanations for ${subject}.`;
    }

    // OpenRouter API call
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            { role: "system", content: systemContext },
            { role: "user", content: contextualPrompt },
          ],
          max_tokens: 2048,
          temperature: 0.7,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return new Response(JSON.stringify({
          error: "API returned an error",
          details: data,
          content: "Sorry, there was an issue generating your content. Please try again later.",
          contentType,
        }), { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (data.choices && data.choices[0]) {
        const generatedText = data.choices[0].message.content;
        return new Response(
          JSON.stringify({ content: generatedText, contentType }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(JSON.stringify({
          error: "Failed to generate content",
          details: data,
          content: "The AI was unable to generate a proper response. Please try a different prompt or try again later.",
          contentType,
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } catch (apiError) {
      return new Response(JSON.stringify({
        error: 'Error calling AI API',
        details: apiError.message,
        content: "We encountered an issue connecting to our AI service. Please try again later.",
        contentType
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred',
      details: error.message,
      content: "An unexpected error occurred while processing your request. Please try again later."
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
