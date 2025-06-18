// Renders generated learning content using ReactMarkdown, KaTeX and highlights code/LaTeX.
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { toast } from "sonner";

interface QAiContentCardProps {
  content: {
    content: string;
    contentType: "notes" | "answer" | "questions" | "explain";
  };
}

const TITLES: Record<string, string> = {
  notes: "Generated Notes",
  answer: "Answer",
  questions: "Practice Questions",
  explain: "Concept Explanation",
};

const DESCRIPTIONS: Record<string, string> = {
  notes: "Comprehensive notes on your topic, fully formatted.",
  answer: "Detailed answer with correct math symbols.",
  questions: "Practice questions rendered with equations, answers, and explanations.",
  explain: "Simple, visual, beautifully formatted explanation of your concept.",
};

export default function QAiContentCard({ content }: QAiContentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {TITLES[content.contentType]}
          <span className="ml-2 text-blue-500">
            <Sparkles className="inline h-4 w-4" />
          </span>
        </CardTitle>
        <CardDescription>
          {DESCRIPTIONS[content.contentType]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 rounded-lg p-4 prose prose-invert max-w-none overflow-x-auto">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ className, children, ...props }) {
                // Inline code vs. code block: react-markdown uses 'pre > code' for blocks,
                // and a single 'code' tag with no parent 'pre' for inline.
                // Here, do NOT use ".inline" prop (does not exist!).
                const child = String(children).trim();
                const isBlock = child.includes('\n');
                if (isBlock) {
                  return (
                    <pre className="bg-black/80 rounded p-2 border border-blue-700 my-2 overflow-auto">
                      <code className={className} {...props}>
                        {child}
                      </code>
                    </pre>
                  );
                }
                return (
                  <code className="bg-black/30 px-1 rounded text-blue-300" {...props}>
                    {child}
                  </code>
                );
              }
            }}
          >
            {content.content}
          </ReactMarkdown>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(content.content);
            toast.success("Content copied to clipboard!");
          }}
        >
          Copy to clipboard
        </Button>
      </CardFooter>
    </Card>
  );
}
