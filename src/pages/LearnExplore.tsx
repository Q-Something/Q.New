import { Link } from "react-router-dom";
import { BookOpen, Book, Brain, GraduationCap, BookMarked, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LearnExplore = () => {
  const tools = [
    {
      id: "q-ai",
      title: "Q.Ai",
      description: "Leverage AI to generate notes, questions, and find relevant educational content.",
      icon: Brain,
      color: "from-blue-500 to-indigo-600",
      features: [
        "AI-powered note generation",
        "Smart question creation",
        "Concept explanations",
        "Personalized learning"
      ],
      buttonText: "Explore Q.Ai"
    },
    {
      id: "q-material",
      title: "Q.Material",
      description: "Access a vast collection of study materials and resources shared by the community.",
      icon: BookMarked,
      color: "from-purple-500 to-fuchsia-600",
      features: [
        "Comprehensive study materials",
        "Subject-wise resources",
        "Community contributions",
        "Easy downloads"
      ],
      buttonText: "Browse Materials"
    },
    {
      id: "qstudy",
      title: "Q.Study",
      description: "Enhance your learning with interactive quizzes and track your progress.",
      icon: GraduationCap,
      color: "from-emerald-500 to-teal-600",
      features: [
        "Interactive quizzes",
        "Progress tracking",
        "Performance analytics",
        "Personalized recommendations"
      ],
      buttonText: "Start Learning"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8 md:py-12 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12 px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 break-words">
            Learn & Explore
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover powerful tools and resources to enhance your learning journey. 
            Explore, engage, and excel in your studies with our comprehensive platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2 md:px-0">
          {tools.map((tool) => (
            <Card key={tool.id} className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center bg-gradient-to-br ${tool.color} text-white`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription className="mt-1">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {tool.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Sparkles className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" size="lg">
                  <Link to={`/${tool.id}`}>
                    {tool.buttonText}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearnExplore;
