import { Link } from "react-router-dom";
import { Book, MessageSquare, Trophy, Flame, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Social = () => {
  const tools = [
    {
      id: "q-story",
      title: "Q.Story",
      description: "Share your academic journey and read inspiring stories from fellow students.",
      icon: Book,
      color: "from-amber-500 to-orange-500",
      features: [
        "Share your educational journey",
        "Read real student experiences",
        "Get inspired by success stories",
        "Connect through shared experiences"
      ],
      buttonText: "Explore Stories"
    },
    {
      id: "q-spark",
      title: "Q.Spark",
      description: "Connect with peers, join discussions, and collaborate on academic topics.",
      icon: MessageSquare,
      color: "from-pink-500 to-rose-500",
      features: [
        "Real-time chat with peers",
        "Join topic-based discussions",
        "Collaborate on study materials",
        "Build your academic network"
      ],
      buttonText: "Start Chatting"
    },
    {
      id: "leaderboard",
      title: "Leaderboard",
      description: "Track your progress and see how you rank among your peers.",
      icon: Trophy,
      color: "from-yellow-500 to-amber-500",
      features: [
        "Weekly and all-time rankings",
        "Track your progress",
        "Compete with friends",
        "Earn achievements"
      ],
      buttonText: "View Rankings"
    },
    {
      id: "daily-streak",
      title: "Daily Streak",
      description: "Maintain your learning streak and earn rewards for consistent study habits.",
      icon: Flame,
      color: "from-orange-500 to-red-500",
      features: [
        "Track your daily progress",
        "Earn streak rewards",
        "Set study goals",
        "View your activity history"
      ],
      buttonText: "Track Streak"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Social & Community
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect, share, and grow with our community of learners. 
            Engage in discussions, track your progress, and stay motivated together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Card key={tool.id} className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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

export default Social;
