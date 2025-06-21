import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import QAiPromptForm from "./QAiPromptForm";
import { Book } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedContent {
  content: string;
  contentType: "notes" | "answer" | "questions" | "explain";
}

interface QAiContainerProps {
  onContentGenerated: (content: GeneratedContent) => void;
}

export default function QAiContainer({ onContentGenerated }: QAiContainerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);

  const handleGenerate = async ({
    prompt,
    grade,
    subject,
    bookName,
    exam,
    contentType,
  }: {
    prompt: string;
    grade?: string;
    subject?: string;
    bookName?: string;
    exam?: string;
    contentType: "notes" | "answer" | "questions" | "explain";
  }) => {
    if (!prompt.trim()) {
      toast.error("Please enter a topic or question first");
      return;
    }

    const promptLower = prompt.trim().toLowerCase();

    if (
      promptLower.includes("who made you") ||
      promptLower.includes("who created you")
    ) {
      const localContent: GeneratedContent = {
        content:
          "I was lovingly crafted by a bunch of smart, sleep‑deprived teens 💻❤️ Just for curious learners like you!",
        contentType: "answer",
      };

      setContent(localContent);
      onContentGenerated(localContent);
      return;
    }

    const finalPrompt = `
You are an expert, friendly tutor AI. Generate a detailed ${contentType} for the following query:

Topic / Question: ${prompt}
${grade ? `Grade Level: ${grade}` : ""}
${subject ? `Subject: ${subject}` : ""}
${bookName ? `Reference Book: ${bookName}` : ""}
${exam ? `Exam Focus: ${exam}` : ""}

Requirements:
- Tailor your answer to the given grade and subject.
- Organize in clear sections with headings.
- Provide examples, definitions, and key points.
- Be concise, accurate, and easy to understand.
`;

    setIsLoading(true);
    toast.info(`Generating ${contentType}...`);

    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-learning-content",
        {
          body: {
            prompt: finalPrompt,
            contentType,
            grade,
            subject,
            bookName,
            exam,
          },
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_KEY}`,
          },
        }
      );

      if (error) throw new Error(error.message);

      setContent(data);
      onContentGenerated(data);
      toast.success(
        `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} generated successfully!`
      );
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What would you like to learn?</CardTitle>
          <CardDescription>
            Enter a topic or question to generate personalized learning content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <QAiPromptForm isLoading={isLoading} onSubmit={handleGenerate} />
        </CardContent>
      </Card>

      {!content && !isLoading && (
        <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-8 min-h-64">
          <Book className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-center text-lg font-medium mb-2">
            Ready to learn with Q.AI
          </p>
          <p className="text-center text-muted-foreground max-w-md">
            Enter a topic or question above, provide optional details like subject (Math, Physics) for formula and symbol support, and select the type of content you'd like to generate.
          </p>
        </div>
      )}
    </>
  );
}
