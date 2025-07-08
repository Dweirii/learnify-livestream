"use client";

import { User } from "@prisma/client";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow/follow-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Users } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/trpc";

interface UserCardProps {
  user: User & {
    stream?: {
      isLive: boolean;
      viewerCount: number;
    } | null;
  };
  showFollowButton?: boolean;
}

export const UserCard = ({ user, showFollowButton = true }: UserCardProps) => {
  const { data: isFollowing } = api.follow.isFollowing.useQuery(
    { userId: user.id },
    { 
      enabled: showFollowButton,
      staleTime: 1000 * 60 * 5,
    }
  );

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2">
        <Link href={`/${user.username}`}>
          <div className="flex items-center gap-3">
            <UserAvatar
              username={user.username}
              imageUrl={user.imageUrl}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {user.username}
              </h3>
              {user.bio && (
                <p className="text-sm text-muted-foreground truncate">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </Link>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-3">
        {user.stream?.isLive && (
          <div className="flex items-center justify-between">
            <Badge variant="destructive" className="text-xs">
              LIVE
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="w-3 h-3" />
              {user.stream.viewerCount}
            </div>
          </div>
        )}
        
        {showFollowButton && (
          <FollowButton 
            userId={user.id} 
            isFollowing={isFollowing}
            size="sm"
            className="w-full"
          />
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          asChild
        >
          <Link href={`/${user.username}`}>
            View Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}; 