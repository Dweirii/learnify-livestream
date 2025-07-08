"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/store/use-sidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Hint } from "@/components/hint";

export const Toggle = () => {
  const { collapsed, onExpand, onCollapse } = useSidebar();

  const label = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <Hint label={label} side="right" asChild>
      <Button
        onClick={() => {
          requestAnimationFrame(() => {
            collapsed ? onExpand() : onCollapse();
          });
        }}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-accent/50 transition-all duration-200"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </Button>
    </Hint>
  );
};
