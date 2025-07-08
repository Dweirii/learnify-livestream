"use client";

import { api } from "@/lib/trpc";
import { Toggle } from "./toggle";
import { Wrapper } from "./wrapper";
import { Recommended } from "./recommended";
import { Following } from "./following";
import { SidebarRoutes } from "./SidebarRoutes";
import { Separator } from "@/components/ui/separator";

export type RecommendedUser = {
  id: string;
  username: string | null;
  imageUrl: string | null;
  stream: {
    isLive: boolean;
    viewers: number;
  } | null;
};

export const Sidebar = () => {
  const { data: recommendedUsers, isLoading: recommendedLoading } = api.stream.getRecommendedUsers.useQuery({
    limit: 10,
  });

  const { 
    data: followedUsers, 
    isLoading: followedLoading,
    error: followedError 
  } = api.follow.getFollowedUsersSidebar.useQuery(
    undefined,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  return (
    <Wrapper>
      <div className="flex flex-col h-full">
        {/* Navigation Routes */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarRoutes />
          
          <Separator className="my-6" />
          
          {/* Following Section */}
          <Following 
            data={followedUsers || []} 
            isLoading={followedLoading}
            error={followedError}
          />
          
          <Separator className="my-6" />
          
          {/* Recommended Section */}
          <Recommended 
            data={recommendedUsers || []} 
            isLoading={recommendedLoading} 
          />
        </div>
      </div>
    </Wrapper>
  );
};
