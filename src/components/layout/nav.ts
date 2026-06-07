import {
  LayoutDashboard,
  Map,
  ListChecks,
  PenLine,
  Layers,
  BookOpen,
  Newspaper,
  Timer,
  Library,
  Bookmark,
  Settings,
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

export const navGroups: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/syllabus", label: "Syllabus Map", icon: Map },
    ],
  },
  {
    heading: "Practice",
    items: [
      { href: "/practice", label: "MCQ Practice", icon: ListChecks },
      { href: "/answers", label: "Answer Writing", icon: PenLine },
      { href: "/flashcards", label: "Flashcards", icon: Layers },
      { href: "/mock-tests", label: "Mock Tests", icon: Timer },
    ],
  },
  {
    heading: "Study",
    items: [
      { href: "/notes", label: "Notes", icon: BookOpen },
      { href: "/current-affairs", label: "Current Affairs", icon: Newspaper },
      { href: "/resources", label: "Resources", icon: Library },
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
