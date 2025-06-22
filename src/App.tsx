import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/context/auth-context";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Discover from "./pages/Discover";
import QAi from "./pages/QAi";
import QMaterial from "./pages/QMaterial";
import QSpark from "./pages/QSpark";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import ChatRoomPage from "./pages/ChatRoomPage";
import QStudy from "./pages/QStudy";
import QuestionUploadPage from "./pages/QuestionUpload";
import AdminUploadTest from "./pages/AdminUploadTest";
import LeaderboardPage from "./pages/Leaderboard";
import DailyStreakPage from "./pages/DailyStreak";
import QStory from "./pages/QStory";
import LearnExplore from "./pages/LearnExplore";
import Social from "./pages/Social";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a public URL configuration object for base URL path
const publicUrl = import.meta.env.BASE_URL || '/';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="qconnect-theme">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={publicUrl}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/qstudy" element={<QStudy />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/q-ai" element={<QAi />} />
                <Route path="/q-material" element={<QMaterial />} />
                <Route path="/q-spark" element={<QSpark />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/daily-streak" element={<DailyStreakPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin/upload-test" element={<AdminUploadTest />} />
                <Route path="/admin/upload-questions" element={<QuestionUploadPage />} />
                {/* Q.Story page route */}
                <Route path="/q-story" element={<QStory />} />
                <Route path="/learn-explore" element={<LearnExplore />} />
                <Route path="/social" element={<Social />} />
              </Route>
              <Route path="/q-spark/chat/:roomId" element={<ChatRoomPage />} />
              <Route path="/admin-panel" element={<Admin />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
