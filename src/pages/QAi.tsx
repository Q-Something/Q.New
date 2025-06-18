
// Main page for Q.Ai, now refactored to be simple!
import QAiContainer from "@/components/qai/QAiContainer";

const QAi = () => (
  <div className="container py-8 px-4">
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          <span className="text-blue-500">Q</span>
          <span className="text-white">.Ai</span>
        </h1>
        <p className="text-muted-foreground">
          Get personalized learning content, answers, practice questions, and explanations — all with beautifully formatted notes,
          <span className="font-semibold text-blue-400 px-1">LaTeX</span> math, <span className="font-semibold text-blue-400 px-1">Markdown</span> structure, and proper physics/chemistry notation!
        </p>
      </div>

      <QAiContainer />

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">How Q.Ai Works</h3>
        <p className="text-muted-foreground">
          Q.Ai uses advanced language models to generate educational content based on your input.
          All answers are formatted in Markdown with full support for mathematical and scientific notation (LaTeX/KaTeX).
          <br />
         
        </p>
      </div>
    </div>
  </div>
);

export default QAi;
