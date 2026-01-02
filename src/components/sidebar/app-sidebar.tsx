"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Settings2,
  Users,
  UserCheck,
  LifeBuoy,
  School,
  LogOut,
  Wallet,
  FileText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./ nav-main";
import { NavSecondary } from "./nav-secondary";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "People",
      url: "/users",
      icon: Users,
      items: [
        {
          title: "Students",
          url: "/students",
        },
        { title: "Teachers", url: "/teachers" },
        // { title: "Team Members", url: "/admins" },
      ],
    },
    {
      title: "Class Management",
      url: "/levels",
      icon: School,
      items: [
        {
          title: "Class & Subjects",
          url: "/levels",
        },
        {
          title: "Schedule",
          url: "/classes",
        },
      ],
    },
    {
      title: "Attendance",
      url: "/attendance",
      icon: UserCheck,
    },
    {
      title: "Exams",
      url: "/exams",
      icon: FileText,
    },
    {
      title: "Finance",
      url: "/finance",
      icon: Wallet,
      items: [
        {
          title: "Dashboard",
          url: "/finance",
        },
        {
          title: "Fee Structures",
          url: "/finance/fees",
        },
        {
          title: "Student Payments",
          url: "/finance/payments",
        },
        {
          title: "Teacher Salaries",
          url: "/finance/salaries",
        },
        {
          title: "Expenses",
          url: "/finance/expenses",
        },
      ],
    },

    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/settings",
        },
        {
          title: "Archive",
          url: "/archive",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support & Feedback",
      url: "/support",
      icon: LifeBuoy,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <School className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    Coaching Management
                  </span>
                  <span className="truncate text-xs">Institute Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Log out">
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
