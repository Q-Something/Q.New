
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Book, UserCircle } from "lucide-react";
import { useMemo } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";

// Import avatar images
import pfp1 from "@/assets/pfp/pfp1.png";
import pfp2 from "@/assets/pfp/pfp2.png";
import pfp3 from "@/assets/pfp/pfp3.png";
import pfp4 from "@/assets/pfp/pfp4.png";

// Array of available profile pictures
const profilePictures = [pfp1, pfp2, pfp3, pfp4];

// Helper function to get a consistent avatar based on user ID
const getUserAvatar = (userId?: string) => {
  if (!userId) return profilePictures[0];
  // Simple hash function to get a consistent index
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return profilePictures[hash % profilePictures.length];
};

const Navbar = () => {
  const { user } = useAuth();
  // Get consistent avatar for the user based on their ID
  const userAvatar = useMemo(() => {
    // Use the user's email if available, otherwise fall back to a default avatar
    const userId = user?.email || 'default-user';
    return getUserAvatar(userId);
  }, [user?.email]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Book className="h-6 w-6 text-blue-500" />
          <span className="font-bold text-xl hidden md:inline-block">
            <span className="text-blue-500">Q</span>
            <span className="text-foreground">.Something</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:gap-x-6 items-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/discover">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Discover
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <ThemeToggle />
          {user ? (
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation - Simplified with just theme toggle and profile */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Link to={user ? "/profile" : "/auth"} className="ml-1">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              {user ? (
                <img 
                  src={userAvatar}
                  alt="Profile"
                  className="h-6 w-6 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to UserCircle if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'flex items-center justify-center h-6 w-6';
                    fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
                    target.parentNode?.insertBefore(fallback, target);
                  }}
                />
              ) : (
                <UserCircle className="h-6 w-6" />
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

const ListItem = ({ className, title, children, ...props }: any) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
};

export default Navbar;
