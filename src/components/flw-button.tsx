"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // from shadcn/ui
import { toast } from "sonner"; // or your preferred toast
import { api } from "@/lib/trpc";

interface FollowButtonProps {
  userId: string;
}

export const FollowButton = ({ userId }: FollowButtonProps) => {
  const [isPending, setIsPending] = useState(false);

  const utils = api.useUtils();
  const { data: isFollowing, isLoading } = api.follow.isFollowing.useQuery({ userId });

  const follow = api.follow.follow.useMutation({
    onMutate: () => setIsPending(true),
    onSuccess: async () => {
      await utils.follow.isFollowing.invalidate({ userId });
      toast.success("Followed");
    },
    onSettled: () => setIsPending(false),
    onError: () => toast.error("Something went wrong"),
  });

  const unfollow = api.follow.unfollow.useMutation({
    onMutate: () => setIsPending(true),
    onSuccess: async () => {
      await utils.follow.isFollowing.invalidate({ userId });
      toast.success("Unfollowed");
    },
    onSettled: () => setIsPending(false),
    onError: () => toast.error("Something went wrong"),
  });

  if (isLoading) return null;

  return (
    <Button
      variant={isFollowing ? "secondary" : "default"}
      disabled={isPending}
      onClick={() => {
        isFollowing
          ? unfollow.mutate({ userId })
          : follow.mutate({ userId });
      }}
    >
      {isPending ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};
