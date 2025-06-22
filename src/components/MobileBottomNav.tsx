import { Link, useLocation } from "react-router-dom";
import { Home, Flame, Compass, Users2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    {
      title: "Home",
      icon: Home,
      path: "/",
      active: path === "/",
    },
    {
      title: "Daily Streak",
      icon: Flame,
      path: "/daily-streak",
      active: path.startsWith("/daily-streak"),
    },
    {
      title: "Learn & Explore",
      icon: Compass,
      path: "/learn-explore",
      active: path.startsWith("/learn-explore"),
    },
    {
      title: "Social",
      icon: Users2,
      path: "/social",
      active: path.startsWith("/social"),
    },
    {
      title: "Chat",
      icon: MessageSquare,
      path: "/q-spark",
      active: path.startsWith("/q-spark"),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full",
              "text-xs font-medium transition-colors",
              item.active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 mb-1",
                item.active ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span className="text-xs">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
