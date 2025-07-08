"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  isFollowing?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const FollowButton = ({ 
  userId, 
  isFollowing = false, 
  size = "default",
  className 
}: FollowButtonProps) => {
  const [isPending, setIsPending] = useState(false);
  
  const utils = api.useUtils();
  
  const followMutation = api.follow.follow.useMutation({
    onMutate: async () => {
      setIsPending(true);
      // Optimistic update
      await utils.follow.isFollowing.cancel({ userId });
      utils.follow.isFollowing.setData({ userId }, true);
    },
    onSuccess: () => {
      toast.success("Successfully followed!");
      utils.follow.getFollowedUsers.invalidate();
      utils.follow.getFollowedUsersSidebar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to follow");
      utils.follow.isFollowing.setData({ userId }, false);
    },
    onSettled: () => {
      setIsPending(false);
    },
  });

  const unfollowMutation = api.follow.unfollow.useMutation({
    onMutate: async () => {
      setIsPending(true);
      // Optimistic update
      await utils.follow.isFollowing.cancel({ userId });
      utils.follow.isFollowing.setData({ userId }, false);
    },
    onSuccess: () => {
      toast.success("Successfully unfollowed!");
      utils.follow.getFollowedUsers.invalidate();
      utils.follow.getFollowedUsersSidebar.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unfollow");
      utils.follow.isFollowing.setData({ userId }, true);
    },
    onSettled: () => {
      setIsPending(false);
    },
  });

  const handleToggleFollow = () => {
    if (isFollowing) {
      unfollowMutation.mutate({ userId });
    } else {
      followMutation.mutate({ userId });
    }
  };

  const isLoading = isPending || followMutation.isPending || unfollowMutation.isPending;

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      size={size}
      className={cn(
        "transition-all duration-200",
        isFollowing && "hover:bg-destructive hover:text-destructive-foreground",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}; 