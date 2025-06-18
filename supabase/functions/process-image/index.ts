
// Gemini replaced with OpenRouter for all generation functions. Only the image-to-text step (Vision/YT keys) stays the same.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const OPENROUTER_API_KEY = "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";
const VISION_API_KEY = Deno.env.get('VISION_API_KEY') || '';
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY') || '';

interface RequestBody {
  image_base64: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: RequestBody = await req.json();
    const imageBase64 = body.image_base64;

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!VISION_API_KEY) {
      return new Response(
        JSON.stringify({
          notes: "API configuration error. Please contact the administrator.",
          questions: "Unable to generate questions due to API configuration error.",
          explanation: "The application is missing essential API configuration. Please try again later.",
          videos: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let extractedText;
    try {
      extractedText = await extractTextFromImage(imageBase64);
    } catch (error) {
      return new Response(
        JSON.stringify({
          notes: "There was an error processing your image with Vision API.",
          questions: "Unable to generate questions due to Vision API error.",
          explanation: "The Vision API encountered an error. Please try again with a different image.",
          videos: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!extractedText || extractedText.length < 10) {
      return new Response(
        JSON.stringify({
          notes: "I couldn't extract enough text from this image. Please try uploading a clearer image of text content.",
          questions: "Unable to generate questions without sufficient text content.",
          explanation: "The image doesn't appear to contain enough readable text. Please make sure the image is clear and contains text content.",
          videos: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const [notes, questions, explanation] = await Promise.all([
      generateNotes(extractedText),
      generateQuestions(extractedText),
      explainConcept(extractedText)
    ]);

    const searchQuery = await generateSearchQuery(extractedText);
    const videos = await findRelatedVideos(searchQuery);

    return new Response(
      JSON.stringify({
        notes,
        questions,
        explanation,
        videos
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        notes: "Sorry, I encountered an error processing your image.",
        questions: "Unable to generate questions due to a processing error.",
        explanation: `There was an issue processing your image: ${error.message}. Please try again with a different image.`,
        videos: []
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function extractTextFromImage(base64Image: string): Promise<string> {
  const image = base64Image.replace(/^data:image\/\w+;base64,/, '');
  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: image },
              features: [
                { type: 'TEXT_DETECTION', maxResults: 50 },
                { type: 'DOCUMENT_TEXT_DETECTION' }
              ],
              imageContext: { languageHints: ["en"] }
            },
          ],
        }),
      }
    );
    if (!response.ok) return '';
    const data = await response.json();
    if (!data.responses || !data.responses[0]) return '';
    const docText = data.responses[0]?.fullTextAnnotation?.text;
    const textAnnotations = data.responses[0]?.textAnnotations?.[0]?.description;
    return docText || textAnnotations || '';
  } catch {
    return '';
  }
}

async function callOpenRouter(prompt: string) {
  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        {
          role: "system",
          content: `You are a helpful educational assistant made for Q.Something, created by some smart teens.
- Always respond using Markdown with LaTeX for formulas and equations, and format explanations with proper headers, bold, italics, and bullet points where appropriate.
- ALL mathematical/chemical/physics notation must be in LaTeX syntax in $...$ or $$...$$.
- Only output Markdown content with rich formatting so user interfaces can render your response with KaTeX + Markdown.`
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 2048,
      temperature: 0.6
    })
  });
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || 'No response found.';
}

async function generateNotes(text: string): Promise<string> {
  return await callOpenRouter(`Create comprehensive study notes from the following text. Use Markdown sections, headings, bullet points, and for any equations, use LaTeX. Make content visually clear for students who will view it in a Markdown+KaTeX viewer:\n\n${text}`);
}
async function generateQuestions(text: string): Promise<string> {
  return await callOpenRouter(`Based on this text, generate 5 diverse practice questions (including at least 1 MCQ) with full answers and explanations. Mark answers with bold, and use LaTeX for any equations. Output in well-structured Markdown:\n\n${text}`);
}
async function explainConcept(text: string): Promise<string> {
  return await callOpenRouter(`Explain the main concept in this text in simple language, using Markdown headings, bullet points, and where possible, LaTeX for any relevant equations. Include analogies or visuals if helpful:\n\n${text}`);
}

async function generateSearchQuery(text: string): Promise<string> {
  return await callOpenRouter(`From the following text, extract the main educational topic as a concise YouTube search query (max 8 words):\n\n${text}`);
}

async function findRelatedVideos(searchQuery: string) {
  if (!searchQuery || !YOUTUBE_API_KEY) return [];
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(searchQuery)}&type=video&key=${YOUTUBE_API_KEY}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const data = await response.json();
    if (data.error) return [];
    return data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url
    })) || [];
  } catch {
    return [];
  }
}
