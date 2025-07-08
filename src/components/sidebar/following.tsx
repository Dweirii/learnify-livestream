"use client";

import { RecommendedUser } from "./index";
import { useSidebar } from "@/store/use-sidebar";
import { UserItem } from "./user-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Users, AlertCircle } from "lucide-react";

interface FollowingProps {
  data: RecommendedUser[];
  isLoading: boolean;
  error?: any;
}

export const Following = ({ data, isLoading, error }: FollowingProps) => {
  const { collapsed } = useSidebar();

  if (error) {
    return (
      <div className="px-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-muted-foreground" />
          {!collapsed && (
            <span className="text-sm font-semibold text-muted-foreground">
              Following
            </span>
          )}
        </div>
        {!collapsed && (
          <div className="px-2 py-6 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              Failed to load following
            </p>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-muted-foreground" />
          {!collapsed && (
            <Skeleton className="h-4 w-16" />
          )}
        </div>
        <div className="space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              {!collapsed && (
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-12" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="px-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-muted-foreground" />
          {!collapsed && (
            <span className="text-sm font-semibold text-muted-foreground">
              Following
            </span>
          )}
        </div>
        {!collapsed && (
          <div className="px-2 py-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              Not following anyone yet
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-4 h-4 text-muted-foreground" />
        {!collapsed && (
          <span className="text-sm font-semibold text-muted-foreground">
            Following
          </span>
        )}
      </div>
      <ul className="space-y-1">
        {data.map((user) => (
          <UserItem
            key={user.id}
            username={user.username!}
            imageUrl={user.imageUrl || "/logo.png"}
            isLive={user.stream?.isLive}
            viewerCount={user.stream?.viewers ?? 0}
          />
        ))}
      </ul>
    </div>
  );
}; 