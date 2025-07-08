"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/use-sidebar";
import { useEffect, useState } from "react";

interface WrapperProps {
  children: React.ReactNode;
}

export const Wrapper = ({ children }: WrapperProps) => {
  const [isClient, setIsClient] = useState(false);
  const { collapsed } = useSidebar();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <aside className="hidden lg:flex flex-col w-60 h-full z-50 bg-background border-r border-border" />
    );
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 flex flex-col h-[calc(100vh-4rem)] z-50 transition-all duration-300 ease-in-out",
        "bg-background border-r border-border",
        collapsed ? "w-[70px]" : "w-60"
      )}
    >
      {children}
    </aside>
  );
};
