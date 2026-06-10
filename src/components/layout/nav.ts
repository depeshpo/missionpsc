import {
  LayoutDashboard,
  Map,
  PenLine,
  Layers,
  BookOpen,
  Newspaper,
  Library,
  Bookmark,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  heading?: string;
  items: NavItem[];
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
export const dashboardNav: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin", label: "Admin", icon: ShieldCheck },
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
