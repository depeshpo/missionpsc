import {
  LayoutDashboard,
  Map,
  PenLine,
  PenSquare,
  Layers,
  BookOpen,
  FileText,
  Newspaper,
  Library,
  Bookmark,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

/**
 * Cookie holding the sidebar collapsed flag ("1" = collapsed). Written by the
 * client Sidebar, read server-side in the dashboard layout.
 *
 * It lives here, not in Sidebar.tsx: every export of a `"use client"` module
 * becomes a client-reference proxy when a server component imports it, so the
 * server would silently receive a function instead of this string.
 */
export const SIDEBAR_COOKIE = "mpsc-sidebar";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Only shown to admins (hidden from non-admin users). */
  adminOnly?: boolean;
}

export interface NavGroup {
  heading?: string;
  items: NavItem[];
  /** Whole group is admin-only (hidden from non-admin users). */
  adminOnly?: boolean;
}

// Learn surface — everything you read/study. Rendered in the (learn) top header.
export const learnNav: NavItem[] = [
  { href: "/syllabus", label: "Syllabus", icon: Map },
  { href: "/notes", label: "Notes", icon: BookOpen },
  { href: "/answers", label: "Answer Writing", icon: PenLine },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/current-affairs", label: "Current Affairs", icon: Newspaper },
  { href: "/resources", label: "Resources", icon: Library },
];

// Dashboard surface — account, progress, management. Rendered in the Sidebar.
// Admin is a labelled section (like Personal), not a collapsible item, so every
// editor is one click away.
export const dashboardNav: NavGroup[] = [
  {
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Admin",
    adminOnly: true,
    items: [
      { href: "/admin", label: "Overview", icon: ShieldCheck },
      { href: "/admin/syllabus", label: "Syllabus", icon: BookOpen },
      { href: "/admin/notes", label: "Notes", icon: FileText },
      { href: "/admin/questions", label: "Questions", icon: PenSquare },
      { href: "/admin/flashcards", label: "Flashcards", icon: Layers },
      { href: "/admin/current-affairs", label: "Current Affairs", icon: Newspaper },
      { href: "/admin/resources", label: "Resources", icon: Library },
    ],
  },
  {
    heading: "Personal",
    items: [
      { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];
