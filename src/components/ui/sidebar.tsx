import * as React from "react";
import { cn } from "@/lib/utils";

// Sticky/fixed sidebar with smooth slide/overlay
export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  collapsed?: boolean;
  withOverlay?: boolean;
  /**
   * Called ONLY when overlay is clicked. For mobile/collapsed logic.
   */
  onOverlayClick?: () => void;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    { className, collapsed = false, withOverlay = false, onOverlayClick, ...props },
    ref
  ) => {
    // Add overlay when collapsed on mobile
    const [showOverlay, setShowOverlay] = React.useState(false);

    React.useEffect(() => {
      if (typeof window === "undefined") return;
      // Show overlay if sidebar is expanded and is small-screen
      function checkOverlay() {
        setShowOverlay(!collapsed && window.innerWidth < 1024);
      }
      checkOverlay();
      window.addEventListener("resize", checkOverlay);
      return () => window.removeEventListener("resize", checkOverlay);
    }, [collapsed]);

    return (
      <>
        <div
          ref={ref}
          className={cn(
            "fixed inset-y-0 left-0 flex flex-col h-full z-40 bg-sidebar text-sidebar-foreground border-r transition-all duration-300 ease-in-out",
            collapsed
              ? "-translate-x-full opacity-0 pointer-events-none w-0"
              : "translate-x-0 opacity-100 w-52 min-w-[13rem]",
            "text-base shadow-lg", // <-- Font size increased here!
            className
          )}
          data-state={collapsed ? "collapsed" : "expanded"}
          {...props}
        />
        {withOverlay && showOverlay && (
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity duration-200"
            onClick={onOverlayClick}
            aria-label="Sidebar overlay"
          />
        )}
      </>
    );
  }
);
Sidebar.displayName = "Sidebar";

// Sidebar content area
export interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex-1 overflow-auto py-2", className)}
      {...props}
    />
  )
);
SidebarContent.displayName = "SidebarContent";

// Sidebar header
export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-4 py-2", className)}
      {...props}
    />
  )
);
SidebarHeader.displayName = "SidebarHeader";

// Sidebar footer
export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-auto px-4 py-4 border-t", className)}
      {...props}
    />
  )
);
SidebarFooter.displayName = "SidebarFooter";

// Sidebar group
export interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-3 py-2", className)}
      {...props}
    />
  )
);
SidebarGroup.displayName = "SidebarGroup";

// Sidebar group label
export interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, SidebarGroupLabelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mb-2 px-2 text-xs font-semibold text-sidebar-foreground/60", className)}
      {...props}
    />
  )
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

// Sidebar group content
export interface SidebarGroupContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, SidebarGroupContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-1", className)}
      {...props}
    />
  )
);
SidebarGroupContent.displayName = "SidebarGroupContent";

// Sidebar menu
export interface SidebarMenuProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
}

export const SidebarMenu = React.forwardRef<HTMLUListElement, SidebarMenuProps>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("space-y-1", className)}
      {...props}
    />
  )
);
SidebarMenu.displayName = "SidebarMenu";

// Sidebar menu item
export interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  className?: string;
}

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("relative", className)}
      {...props}
    />
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";

// Sidebar menu button
export interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  isActive?: boolean;
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive = false, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent hover:text-accent-foreground",
        props.disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
);
SidebarMenuButton.displayName = "SidebarMenuButton";

// Sidebar menu badge
export interface SidebarMenuBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

export const SidebarMenuBadge = React.forwardRef<HTMLSpanElement, SidebarMenuBadgeProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs font-medium",
        className
      )}
      {...props}
    />
  )
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

// Sidebar trigger button
export interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex items-center justify-center rounded-md p-2 text-sidebar-foreground/60 hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
);
SidebarTrigger.displayName = "SidebarTrigger";

// Sidebar inset (content area that adjusts to sidebar state)
export interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const SidebarInset = React.forwardRef<HTMLDivElement, SidebarInsetProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex-1", className)}
      {...props}
    />
  )
);
SidebarInset.displayName = "SidebarInset";

// Sidebar context for state management
type SidebarState = "expanded" | "collapsed";

interface SidebarContextValue {
  state: SidebarState;
  setState: (state: SidebarState) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export interface SidebarProviderProps {
  children: React.ReactNode;
  defaultState?: SidebarState;
}

export function SidebarProvider({
  children,
  defaultState = "expanded",
}: SidebarProviderProps) {
  const [state, setState] = React.useState<SidebarState>(defaultState);
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  const toggleSidebar = React.useCallback(() => {
    setState(state === "expanded" ? "collapsed" : "expanded");
  }, [state]);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ state, setState, toggleSidebar, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}
