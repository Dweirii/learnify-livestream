// src/components/sidebar/SidebarRoutes.tsx
"use client";

import { Home, Video, Heart, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/store/use-sidebar";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const SidebarRoutes = () => {
  const { collapsed } = useSidebar();
  const pathname = usePathname();

  const routes = [
    { 
      label: "Home", 
      icon: Home, 
      href: "/",
      active: pathname === "/"
    },
    { 
      label: "Browse", 
      icon: Video, 
      href: "/browse",
      active: pathname === "/browse"
    },
    { 
      label: "Following", 
      icon: Heart, 
      href: "/following",
      active: pathname === "/following"
    },
    { 
      label: "Trending", 
      icon: TrendingUp, 
      href: "/trending",
      active: pathname === "/trending"
    },
    { 
      label: "Discover", 
      icon: Users, 
      href: "/discover",
      active: pathname === "/discover"
    },
  ];

  const routeContent = (route: typeof routes[0]) => (
    <div className="flex items-center gap-3">
      <route.icon className="w-5 h-5" />
      {!collapsed && <span>{route.label}</span>}
    </div>
  );

  return (
    <div className="px-4">
      <TooltipProvider>
        <ul className="space-y-1">
          {routes.map((route) => {
            const content = (
              <Link
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  collapsed && "justify-center",
                  route.active && "bg-accent text-accent-foreground"
                )}
              >
                {routeContent(route)}
              </Link>
            );

            if (collapsed) {
              return (
                <li key={route.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {content}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {route.label}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return (
              <li key={route.href}>
                {content}
              </li>
            );
          })}
        </ul>
      </TooltipProvider>
    </div>
  );
};