
import { Link } from "react-router-dom";
import { Book, BookOpen, Upload, Users, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { TBHCard } from "@/components/tbh/TBHCard";

const Discover = () => {
  const tools = [
    {
      id: "qstudy",
      title: "Q.Study Quiz",
      description: "Daily MCQ quiz, leaderboards, and toppers' badges. Upload daily questions (volunteers) or solve & compete (students)!",
      icon: ListChecks,
      color: "bg-green-600",
      features: [
        "Daily MCQ quiz for each grade & subject",
        "Leaderboard and badges for toppers",
        "Volunteer/admins can upload questions",
        "Track your progress"
      ],
      buttonText: "Go to Q.Study"
    },
    {
      id: "q-ai",
      title: "Q.Ai",
      description: "Generate notes, questions, and find relevant videos from book pages using AI.",
      icon: BookOpen,
      color: "bg-blue-500",
      features: [
        "Notes generation from book pages",
        "Advanced question generation",
        "Related YouTube videos",
        "Concept explanations"
      ],
      buttonText: "Try Q.Ai"
    },
    {
      id: "q-material",
      title: "Q.Material",
      description: "Share and access high-quality study materials from the community.",
      icon: Upload,
      color: "bg-purple-500",
      features: [
        "Upload study materials",
        "Download community resources",
        "Search by topic or subject",
        "Preview documents before download"
      ],
      buttonText: "Browse Materials"
    },
    {
      id: "q-spark",
      title: "Q.Spark",
      description: "Find and connect with study partners who share your academic interests.",
      icon: Users,
      color: "bg-pink-500",
      features: [
        "Create your student profile",
        "Find compatible study partners",
        "Connect through social media",
        "Bookmark favorite connections"
      ],
      buttonText: "Find Partners"
    },
    // Q.Story tool card
    {
      id: "q-story",
      title: "Q.Story",
      description: "Share your student journey and read inspiring real stories from the community.",
      icon: Book,
      color: "bg-amber-500",
      features: [
        "Upload and share your story as a PDF",
        "Read stories from other students",
        "Bookmark your favorites",
        "Get inspired by real journeys"
      ],
      buttonText: "Explore Stories"
    },
  ];

  return (
    <div className="container py-12 px-4">
      {/* TBH block at top of discover page */}
      <div id="tbh" className="mb-8">
        <TBHCard />
      </div>

      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Discover Our Learning Tools</h1>
        <p className="text-lg text-muted-foreground">
          Explore our suite of tools designed to enhance your learning experience and help you succeed in your studies.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {tools.map((tool) => (
          <div key={tool.id} className="animate-fade-in">
            <Card className="h-full flex flex-col border-t-4" style={tool.id === "q-story" ? { borderTopColor: "#fbbf24" } : { borderTopColor: `var(--${tool.color})` }}>
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tool.color} bg-opacity-20 mb-4`}>
                  <tool.icon className="h-6 w-6" style={tool.id === "q-story" ? { color: "#fbbf24" } : { color: `var(--${tool.color})` }} />
                </div>
                <CardTitle className="text-2xl">{tool.title}</CardTitle>
                <CardDescription className="text-base">{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {tool.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to={`/${tool.id}`}>{tool.buttonText}</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discover;

