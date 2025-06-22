import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { NotificationBanner } from "./NotificationBanner";
import { useNotifications } from "@/hooks/use-notifications";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { PhantomBabaWidget } from "./PhantomBabaWidget";
import { useEffect, useState } from "react";
import MobileBottomNav from "./MobileBottomNav";

// SidebarOpener must be inside SidebarProvider!
const SidebarOpener = () => {
  const { state, isMobile, toggleSidebar } = useSidebar();

  if (isMobile || state !== "collapsed") return null;

  return (
    <SidebarTrigger
      onClick={toggleSidebar}
      className="fixed left-2 top-1/2 z-[1000] -translate-y-1/2 bg-sidebar border border-sidebar-border rounded-full shadow-lg p-2 w-12 h-12 flex items-center justify-center hover:bg-accent transition"
      aria-label="Open sidebar"
    >
      <span className="sr-only">Open sidebar</span>
      {/* Hamburger Icon */}
      <svg
        className="h-8 w-8 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </SidebarTrigger>
  );
};

const LayoutContent = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    incompleteTestCount,
    unreadMessageCount,
    showTestBanner,
    showMessageBanner,
    handleDismissTest,
    handleDismissMessage,
  } = useNotifications();
  const { state } = useSidebar();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  let errorMsg = "";
  try {

    // Sidebar layout: allow sidebar everywhere except on certain minimal full-pages
    const showSidebar = !["/auth", "/admin"].some((r) => location.pathname.startsWith(r));
    const sidebarWidth = showSidebar && state === "expanded" && !isMobileView ? "ml-[13rem]" : "ml-0";

    return (
      <div className="flex min-h-screen w-full">
        {showSidebar && !isMobileView && (
          <>
            <AppSidebar />
            <SidebarOpener />
          </>
        )}
        {/* Main Content */}
        <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out ${isMobileView ? 'ml-0' : sidebarWidth}`}>
          {/* NotificationBanners */}
          <NotificationBanner
            show={showTestBanner}
            type="test"
            message={
              incompleteTestCount === 1
                ? "You haven't completed today's test yet."
                : incompleteTestCount > 1
                  ? `You have ${incompleteTestCount} incomplete tests or quizzes today.`
                  : ""
            }
            linkText="Go to Q.Study"
            onClickLink={() => navigate("/qstudy")}
            onClose={handleDismissTest}
          />
          <NotificationBanner
            show={showMessageBanner}
            type="message"
            message={
              unreadMessageCount === 1
                ? "You have 1 unread message."
                : unreadMessageCount > 1
                  ? `You have ${unreadMessageCount} unread messages.`
                  : ""
            }
            linkText="Go to Q.Spark"
            onClickLink={() => navigate("/q-spark")}
            onClose={handleDismissMessage}
          />
          <Navbar />
          <SidebarInset>
            <main className="flex-1 pb-16 md:pb-0">
              <Outlet />
            </main>
          </SidebarInset>
          <Footer />
        </div>
        {isMobileView && <MobileBottomNav />}
        <PhantomBabaWidget />
      </div>
    );
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : String(e);
    console.error("Error in LayoutContent rendering:", e);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-destructive">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <pre className="bg-red-100 text-red-800 p-4 rounded max-w-2xl">{errorMsg}</pre>
        <p>Please check the developer console for more details.</p>
      </div>
    );
  }
};

// Only the provider here!
const Layout = () => (
  <SidebarProvider>
    <LayoutContent />
  </SidebarProvider>
);

export default Layout;
