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

/** A child link under a collapsible nav item. No `href` (or `comingSoon`) = disabled. */
export interface NavChild {
  label: string;
  icon: LucideIcon;
  href?: string;
  comingSoon?: boolean;
}

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** When present, the item renders as a collapsible group with these children. */
  children?: NavChild[];
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
      {
        href: "/admin",
        label: "Admin",
        icon: ShieldCheck,
        children: [
          { label: "Syllabus", icon: BookOpen, href: "/admin/syllabus" },
          { label: "Notes", icon: FileText, comingSoon: true },
          { label: "Questions", icon: PenSquare, href: "/admin/questions" },
          { label: "Flashcards", icon: Layers, href: "/admin/flashcards" },
          { label: "Current Affairs", icon: Newspaper, href: "/admin/current-affairs" },
          { label: "Resources", icon: Library, href: "/admin/resources" },
        ],
      },
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
