import QAiContainer from "@/components/qai/QAiContainer";
import QAiContentCard from "@/components/qai/QAiContentCard";
import { useState } from "react";

const QAi = () => {
  const [generatedContent, setGeneratedContent] = useState<{
    content: string;
    contentType: "notes" | "answer" | "questions" | "explain";
  } | null>(null);

  return (
    <div className="container py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-1">
            <span className="text-blue-500">Q</span>
            <span className="text-white">.Ai</span>
          </h1>
          <p className="text-muted-foreground text-lg mt-2 leading-relaxed">
            Get personalized learning content, answers, practice questions, and explanations —
            beautifully formatted with <span className="font-semibold text-blue-400">LaTeX</span> math,{" "}
            <span className="font-semibold text-blue-400">Markdown</span>, and science notation.
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Prompt + Input */}
          <div className="bg-muted/30 p-4 rounded-xl border border-border shadow-sm">
            <QAiContainer onContentGenerated={setGeneratedContent} />
          </div>

          {/* Right: AI Response */}
          <div className="bg-background p-4 rounded-xl border border-border shadow-sm max-h-[75vh] overflow-y-auto">
            {generatedContent ? (
              <QAiContentCard content={generatedContent} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <p className="text-lg font-semibold">Your AI content will appear here.</p>
                <p className="text-sm">Ask a question or enter a topic to begin.</p>
              </div>
            )}
          </div>
        </div>

        {/* How it Works */}
        <div className="p-6 bg-muted/20 rounded-xl border max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold mb-2">How Q.Ai Works</h3>
          <p className="text-muted-foreground text-base leading-relaxed">
            Q.Ai uses advanced AI models to generate educational content based on your input. 
            All results are formatted in Markdown and LaTeX (KaTeX), tailored to subjects like math, science, and literature.
            You can request notes, detailed answers, practice questions, or even concept breakdowns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QAi;
