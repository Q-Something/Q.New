import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { useRef } from "react";

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
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (!pdfRef.current) return;

    const opt = {
      margin: 0.5,
      filename: `${content.contentType}-QAi.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(pdfRef.current).save();
  };

  return (
    <Card className="border border-border bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {TITLES[content.contentType]}
          <Sparkles className="text-blue-500 h-4 w-4" />
        </CardTitle>
        <CardDescription>{DESCRIPTIONS[content.contentType]}</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div
          ref={pdfRef}
          className="bg-muted/20 px-6 py-4 rounded-lg overflow-x-auto prose prose-invert max-w-none text-sm leading-relaxed"
        >
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ className, children, ...props }) {
                const child = String(children).trim();
                const isBlock = child.includes("\n");

                if (isBlock) {
                  return (
                    <pre className="bg-zinc-900 text-white rounded-lg px-4 py-3 mb-4 overflow-auto border border-zinc-700 text-sm">
                      <code className={className} {...props}>
                        {child}
                      </code>
                    </pre>
                  );
                }

                return (
                  <code className="bg-zinc-800 text-blue-300 px-1.5 py-0.5 rounded text-sm" {...props}>
                    {child}
                  </code>
                );
              },
            }}
          >
            {content.content}
          </ReactMarkdown>
        </div>
      </CardContent>

      <CardFooter className="justify-end p-4 space-x-2">
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(content.content);
            toast.success("Content copied to clipboard!");
          }}
        >
          Copy to clipboard
        </Button>
        <Button onClick={handleDownloadPDF} variant="default">
          <Download className="h-4 w-4 mr-2" />
          Download as PDF
        </Button>
      </CardFooter>
    </Card>
  );
}
