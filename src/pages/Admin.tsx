import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { MaterialsTable, StudyMaterial } from "@/components/admin/MaterialsTable";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminQuestionsPanel } from "@/components/admin/AdminQuestionsPanel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PhantomBabaAdminPanel } from "@/components/admin/PhantomBabaAdminPanel";
import { AdminStoryReview } from "@/components/admin/AdminStoryReview";
import { TBHAdminPanel } from "@/components/admin/TBHAdminPanel";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("admin-auth") === "yes");
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [counts, setCounts] = useState({
    questions: 0,
    materials: 0,
    expired: 0,
    stories: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    }
  });

  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select(`
          *,
          profiles:user_id(username, id)
        `);

      if (error) throw error;

      setMaterials(data.map((item: any) => ({
        ...item,
        uploaded_by: item.profiles?.username || "Unknown",
        user_info: {
          id: item.profiles?.id,
          username: item.profiles?.username
        }
      })));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCounts = async () => {
    // --- Change here: Use ONLY the new tables for dashboard stats ---
    // 1. Count total test questions
    const { data: testQuestions, error: qErr } = await supabase
      .from("study_test_questions")
      .select("id");
    // 2. Count study materials (no change)
    const { data: materials, error: mErr } = await supabase
      .from("study_materials")
      .select("id");
    // 3. Count expired quizzes (tests whose expiry_at < now)
    const { data: tests, error: tErr } = await supabase
      .from("study_tests")
      .select("id,expiry_at");

    let expiredCount = 0;
    if (tests) {
      const now = new Date();
      expiredCount = tests.filter((t: any) => t.expiry_at && new Date(t.expiry_at) < now).length;
    }

    // 4. QStory stats (pending/approved/rejected/total)
    let storyStats = { total: 0, pending: 0, approved: 0, rejected: 0 };
    const { data: stories, error: stErr } = await supabase
      .from("qstories")
      .select("status");
    if (stories && Array.isArray(stories)) {
      storyStats.total = stories.length;
      for (const s of stories) {
        if (s.status === "pending") storyStats.pending += 1;
        else if (s.status === "approved") storyStats.approved += 1;
        else if (s.status === "rejected") storyStats.rejected += 1;
      }
    }

    setCounts({
      questions: testQuestions?.length ?? 0,
      materials: materials?.length ?? 0,
      expired: expiredCount,
      stories: storyStats
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMaterials();
      loadCounts();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin-auth");
  };

  if (!isAuthenticated) {
    return <AdminLoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar section={activeSection} setSection={setActiveSection} />
        {/* FIX: Add margin-left to main content so it doesn't hide behind the sidebar */}
        <div className="flex-1 container py-8 px-4 ml-0 md:ml-[13rem] transition-all duration-300 ease-in-out">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <span className="text-blue-500">Q</span>
                <span className="text-white">.Admin</span>
              </h1>
            </header>
            {/* Dashboard Content Switch */}
            {activeSection === "dashboard" && (
              <>
                <AdminDashboard
                  totalQuestions={counts.questions}
                  totalMaterials={counts.materials}
                  totalExpired={counts.expired}
                  storyStats={counts.stories}
                />
                <div className="mt-8">
                  <Button variant="default" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            )}
            {activeSection === "materials" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Study Materials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MaterialsTable
                      materials={materials}
                      setMaterials={setMaterials}
                      isLoading={isLoading}
                      reloadMaterials={loadMaterials}
                    />
                  </CardContent>
                </Card>
                <div className="mt-8">
                  <Button variant="default" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            )}
            {activeSection === "questions" && (
              <>
                <AdminQuestionsPanel />
                <div className="mt-8">
                  <Button variant="default" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            )}
            {activeSection === "story-review" && (
              <div className="mt-4">
                <AdminStoryReview />
                <div className="mt-8">
                  <Button variant="default" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            )}
            {/* === TBH ADMIN Section === */}
            {activeSection === "tbh-admin" && (
              <div className="mt-4">
                <TBHAdminPanel />
                <div className="mt-8">
                  <Button variant="default" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            )}
            {activeSection === "settings" && (
              <div className="text-muted-foreground text-center pt-10">
                Settings page coming soon.
              </div>
            )}
            {/* === Phantom Baba ADMIN Section === */}
            {activeSection === "phantom-baba" && (
              <div className="mt-8">
                <PhantomBabaAdminPanel />
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
