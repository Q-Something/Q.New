import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";
import { Book, BookOpen, Upload, Users } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { fetchTopUsers } from "@/lib/api/leaderboard-api";
import { LeaderboardCard } from "@/components/leaderboard/LeaderboardCard";
import { useDailyVisit } from "@/lib/hooks/useDailyVisit";
import { useNavigate } from "react-router-dom";
import { Medal } from "lucide-react";
import { TBHCard } from "@/components/tbh/TBHCard";

// sortLeaders function is no longer needed here, as the API handles sorting.

const Index = () => {
  const features = [
    {
      title: "Q.Ai",
      description: "Get instant notes, questions and explanations using AI.",
      icon: BookOpen,
    },
    {
      title: "Q.Material",
      description: "Share and access high-quality study materials from a community of students across subjects.",
      icon: Upload,
    },
    {
      title: "Q.Spark",
      description: "Connect with study partners who share your academic goals and interests.",
      icon: Users,
    },
  ];

  // Leaderboard state
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useDailyVisit(); // Track daily visit and points

  useEffect(() => {
    // Fetch top 5 users, already sorted by the unified API function
    fetchTopUsers(5).then(data => {
      setLeaders(data); 
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Smoothly scroll to the TBH card if coming from "/#tbh" or the hash updates
  const tbhRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.location.hash === "#tbh" || window.location.hash === "#TBH") {
      setTimeout(() => {
        const el = document.getElementById("tbh");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 80); // Wait for page paint
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-r from-qlearn-blue/10 via-qlearn-purple/10 to-qlearn-pink/10" />
        <div className="container relative z-10 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Crack the clue, level up with Q!!
            </h1>
            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              A community platform where students can share notes, upload study material, and find study partners to excel together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="px-8">
                <Link to="/q-ai">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/discover">Discover Tools</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Move TBH Feature just below hero, above leaderboard */}
      <section
        className="container px-4 mt-[-40px] z-20 relative"
        id="tbh"
        ref={tbhRef}
      >
        <TBHCard />
      </section>
      {/* Leaderboard Widget Section */}
      <section className="py-10 bg-gradient-to-bl from-qlearn-blue/10 to-qlearn-purple/10">
        <div className="container">
          <div className="flex items-center gap-2 mb-2">
            <Medal className="text-yellow-400" size={22} />
            <h2 className="font-bold text-2xl">Overall Leaderboard</h2>
            <button 
              onClick={() => navigate("/leaderboard")}
              className="ml-auto border rounded px-3 py-1 text-sm font-medium hover:bg-muted transition"
            >
              View Full Leaderboard
            </button>
          </div>
          {/* Make sure sparks (coins) are always shown */}
          <LeaderboardCard 
            leaders={leaders} 
            showSparks
            sparkBy="followers_count"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4">
          <div className="mx-auto max-w-md text-center mb-12">
            <h2 className="text-3xl font-bold">Powerful Learning Tools</h2>
            <p className="mt-4 text-muted-foreground">
              Access a suite of tools designed to enhance your learning experience
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16">
        <div className="container px-4">
          <div className="mx-auto max-w-md text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-4 text-muted-foreground">
              Simple steps to get started with Q.Something
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <span className="font-bold text-primary text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold">Choose a Tool</h3>
              <p className="mt-2 text-muted-foreground">
                Select from Q.Ai, Q.Material, or Q.Spark based on your needs
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <span className="font-bold text-primary text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold">Upload Content</h3>
              <p className="mt-2 text-muted-foreground">
                Share book pages, study materials, or create your profile
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <span className="font-bold text-primary text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold">Connect & Learn</h3>
              <p className="mt-2 text-muted-foreground">
                Access generated notes, download materials, or find study partners
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-qlearn-blue to-qlearn-purple text-white">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
            <p className="mb-6">
              Join our community of students dedicated to sharing knowledge and helping each other succeed.
            </p>
            <Button asChild size="lg" variant="secondary" className="px-8">
              <Link to="/discover">Explore Tools</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
