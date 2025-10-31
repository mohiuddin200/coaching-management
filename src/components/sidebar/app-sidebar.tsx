"use client"

import * as React from "react"
import {
  BookOpen,
  CreditCard,
  FileText,
  LayoutDashboard,
  Megaphone,
  Settings2,
  Users,
  UserCheck,
  GraduationCap,
  LifeBuoy,
  Send,
  School,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "./ nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Students",
      url: "/students",
      icon: GraduationCap,
    },
    {
      title: "Teachers",
      url: "/teachers",
      icon: Users,
    },
    {
      title: "Classes",
      url: "/classes",
      icon: BookOpen,
    },
    {
      title: "Levels & Subjects",
      url: "/levels",
      icon: School,
    },
    {
      title: "Attendance",
      url: "/attendance",
      icon: UserCheck,
      items: [
        {
          title: "Mark Attendance",
          url: "/attendance/mark",
        },
        {
          title: "View Records",
          url: "/attendance/records",
        },
        {
          title: "Reports",
          url: "/attendance/reports",
        },
      ],
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: CreditCard,
      items: [
        {
          title: "Payments",
          url: "/accounts/payments",
        },
        {
          title: "Expenses",
          url: "/accounts/expenses",
        },
        {
          title: "Reports",
          url: "/accounts/reports",
        },
      ],
    },
    {
      title: "Exams",
      url: "/exams",
      icon: FileText,
      items: [
        {
          title: "All Exams",
          url: "/exams",
        },
        {
          title: "Create Exam",
          url: "/exams/create",
        },
        {
          title: "Results",
          url: "/exams/results",
        },
      ],
    },
    {
      title: "Marketing",
      url: "/marketing",
      icon: Megaphone,
      items: [
        {
          title: "Contacts",
          url: "/marketing/contacts",
        },
        {
          title: "Campaigns",
          url: "/marketing/campaigns",
        },
        {
          title: "SMS Logs",
          url: "/marketing/sms-logs",
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
          url: "/settings/general",
        },
        {
          title: "Users & Roles",
          url: "/admin/users",
        },
        {
          title: "SMS Configuration",
          url: "/settings/sms",
        },
        {
          title: "Notifications",
          url: "/settings/notifications",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <School className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Coaching Management</span>
                  <span className="truncate text-xs">Institute Portal</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
