import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Book, UserCircle } from "lucide-react";
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

const Navbar = () => {
  const { user } = useAuth();
  // Get avatar for the user from their profile
  const userAvatar = user?.user_metadata?.avatar_url;

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
                {userAvatar ? (
                  <img src={userAvatar} alt="Profile" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <span className="h-6 w-6 flex items-center justify-center rounded-full bg-muted text-lg font-bold">
                    {user.user_metadata?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
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
                userAvatar ? (
                  <img 
                    src={userAvatar}
                    alt="Profile"
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="h-6 w-6 flex items-center justify-center rounded-full bg-muted text-lg font-bold">
                    {user.user_metadata?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </span>
                )
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
