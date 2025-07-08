"use client";

import { api } from "@/lib/trpc";
import { UserCard } from "@/components/user-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertCircle } from "lucide-react";

interface FollowingListProps {
  userId: string;
}

export const FollowingList = ({ userId }: FollowingListProps) => {
  const { data: following, isLoading, error } = api.follow.getFollowedUsers.useQuery(
    undefined,
    { 
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground/50" />
            <div>
              <h3 className="text-lg font-semibold">Failed to load following</h3>
              <p className="text-muted-foreground">
                Please try refreshing the page
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!following || following.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50" />
            <div>
              <h3 className="text-lg font-semibold">Not following anyone yet</h3>
              <p className="text-muted-foreground">
                Start following creators to see their streams here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {following.map((follow) => (
        <UserCard 
          key={follow.following.id} 
          user={follow.following}
          showFollowButton={false}
        />
      ))}
    </div>
  );
}; 