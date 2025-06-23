
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { LayoutDashboard, FileText, Book, BookOpen, Users, Cog, Ghost, Eye } from "lucide-react";
import React from "react";

interface AdminSidebarProps {
  section: string;
  setSection: (val: string) => void;
}
const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "materials", label: "Study Materials", icon: Book },
  { key: "questions", label: "Q.Study Questions", icon: FileText },
  // Add Story Review section here
  { key: "story-review", label: "Q.Story Review", icon: BookOpen },
  // Add TBH Admin section
  { key: "tbh-admin", label: "TBH Management", icon: Eye },
  { key: "settings", label: "Settings", icon: Cog, disabled: true },
  // Phantom Baba admin tool:
  { key: "phantom-baba", label: "Phantom Baba", icon: Ghost },
];
export const AdminSidebar: React.FC<AdminSidebarProps> = ({ section, setSection }) => (
  <Sidebar>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navItems.map(item => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  onClick={() => setSection(item.key)}
                  isActive={section === item.key}
                  disabled={item.disabled}
                >
                  <item.icon className="mr-2" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
);
