"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/use-sidebar";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isActive,
}: SidebarItemProps) => {
  const { collapsed } = useSidebar();

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-x-2 text-muted-foreground text-sm font-medium hover:text-primary transition px-3 py-2 rounded-md",
        {
          "bg-accent text-primary": isActive,
          "justify-center": collapsed,
        }
      )}
    >
      <Icon className="w-5 h-5" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
};
