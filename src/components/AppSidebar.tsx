import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { useNotifications } from "@/hooks/use-notifications";
import {
  Home,
  ListChecks,
  BookOpen,
  Upload,
  Users,
  MessageSquare,
  UserCircle,
  Menu,
  Trophy,
  Flame,
  X,
  Book,
} from "lucide-react";
import * as React from "react";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadMessageCount } = useNotifications();
  const { state, setState, isMobile, toggleSidebar } = useSidebar();
  const [collapsing, setCollapsing] = React.useState(false);

  // Sidebar navigation items
  const navItems = [
    {
      title: "Home",
      icon: Home,
      iconColor: "text-blue-700",
      path: "/",
      isActive: location.pathname === "/",
    },
    {
      title: "Q.Study",
      icon: ListChecks,
      iconColor: "text-green-600",
      path: "/qstudy",
      isActive: location.pathname.startsWith("/qstudy"),
    },
    {
      title: "Leaderboard",
      icon: Trophy,
      iconColor: "text-yellow-500",
      path: "/leaderboard",
      isActive: location.pathname.startsWith("/leaderboard"),
    },
    {
      title: "Daily Streak & Points",
      icon: Flame,
      iconColor: "text-orange-500",
      path: "/daily-streak",
      isActive: location.pathname.startsWith("/daily-streak"),
    },
    {
      title: "Q.Ai",
      icon: BookOpen,
      iconColor: "text-indigo-500",
      path: "/q-ai",
      isActive: location.pathname.startsWith("/q-ai"),
    },
    {
      title: "Q.Material",
      icon: Upload,
      iconColor: "text-purple-600",
      path: "/q-material",
      isActive: location.pathname.startsWith("/q-material"),
    },
    // Add Q.Story sidebar entry
    {
      title: "Q.Story",
      icon: Book,
      iconColor: "text-amber-600",
      path: "/q-story",
      isActive: location.pathname.startsWith("/q-story"),
    },
    {
      title: "Q.Spark (Chat)",
      icon: MessageSquare,
      iconColor: "text-pink-500",
      path: "/q-spark",
      isActive: location.pathname.startsWith("/q-spark"),
      badge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
    },
    {
      title: "Profile",
      icon: UserCircle,
      iconColor: "text-gray-700",
      path: "/profile",
      isActive: location.pathname.startsWith("/profile"),
    },
    {
      title: "TBH!",
      icon: BookOpen,
      iconColor: "text-blue-500",
      path: "/#tbh",
      isActive:
        location.pathname === "/" &&
        (window.location.hash === "#tbh" || window.location.hash === "#TBH" || window.location.hash.includes("tbh")),
      isTBHAnchor: true,
    },
  ];

  // Custom handler for TBH navigation
  function handleTBHNavigate(item: any) {
    const scrollToTBH = () => {
      setTimeout(() => {
        const el = document.getElementById("tbh");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 80); // slight delay
      // Update the hash without scrolling (prevents jump)
      if (window.location.hash !== "#tbh") {
        window.history.replaceState(
          null,
          "",
          "#tbh"
        );
      }
    };

    if (location.pathname === "/") {
      // Already on homepage
      scrollToTBH();
      if (isMobile) setState("collapsed");
    } else {
      // Not on home; navigate to home first, then scroll after route change
      navigate("/#tbh");
      if (isMobile) setState("collapsed");
      // The homepage TBH effect will scroll on hash change, so nothing else needed here.
    }
  }

  // Escape key closes on mobile
  React.useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if ((e.key === "Escape" || e.key === "Esc") && state === "expanded" && isMobile) {
        setState("collapsed");
      }
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [state, setState, isMobile]);

  // Overlay click closes sidebar (for mobile)
  function handleOverlayClick() {
    if (isMobile) setState("collapsed");
  }

  return (
    <Sidebar collapsed={state === "collapsed"} withOverlay={isMobile && state === "expanded"} onOverlayClick={handleOverlayClick}>
      <SidebarHeader>
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <h2 className="font-extrabold text-base tracking-tight">Menu</h2>
          {(isMobile || state !== "collapsed") && (
            <button
              className="ml-2 rounded-lg p-2 h-8 w-8 text-lg hover:bg-accent"
              onClick={() => setState(state === "collapsed" ? "expanded" : "collapsed")}
              aria-label={state === "collapsed" ? "Open sidebar" : "Close sidebar"}
            >
              {state === "collapsed" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold text-sidebar-foreground/90 py-1 text-base">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={item.isActive}
                    onClick={
                      item.isTBHAnchor
                        ? () => handleTBHNavigate(item)
                        : () => {
                            navigate(item.path);
                            if (isMobile) setState("collapsed");
                          }
                    }
                    aria-label={item.title}
                    className="flex items-center gap-3 px-2 py-3 rounded-md font-semibold text-base"
                  >
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.badge !== undefined && item.badge > 0 && (
                    <SidebarMenuBadge className="bg-pink-500 text-white right-2 top-2">
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
