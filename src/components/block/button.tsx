"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BlockUserExampleProps {
  userToBlock: {
    id: string;
    username: string | null;
    imageUrl: string | null;
  };
}

export const BlockUserExample = ({ userToBlock }: BlockUserExampleProps) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const utils = api.useUtils();

  const blockUserMutation = api.stream.blockUser.useMutation({
    onMutate: async ({ otherUserId }) => {
      await utils.stream.getRecommendedUsers.cancel();
      const previousRecommended = utils.stream.getRecommendedUsers.getData({});

      utils.stream.getRecommendedUsers.setData({}, (old) => {
        return old?.filter(user => user.id !== otherUserId);
      });

      setIsBlocked(true);
      return { previousRecommended };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousRecommended) {
        utils.stream.getRecommendedUsers.setData({}, ctx.previousRecommended);
      }
      setIsBlocked(false);
      toast.error("فشل حظر المستخدم");
    },
    onSuccess: (data) => {
      toast.success(`Blocked ${data.username || "user"} successfully`);
    },
    onSettled: () => {
      utils.stream.getRecommendedUsers.invalidate();
    },
  });

  const handleBlockUser = () => {
    blockUserMutation.mutate({ otherUserId: userToBlock.id });
  };

  if (isBlocked) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
        <UserAvatar 
          username={userToBlock.username || "User"} 
          imageUrl={userToBlock.imageUrl || ""} 
        />
        <span className="text-sm text-muted-foreground">
          {userToBlock.username} blocked
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2 rounded-lg border">
      <div className="flex items-center gap-2">
        <UserAvatar 
          username={userToBlock.username || "User"} 
          imageUrl={userToBlock.imageUrl || ""} 
        />
        <span className="text-sm font-medium">
          {userToBlock.username || "Unknown User"}
        </span>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleBlockUser}
        disabled={blockUserMutation.isPending}
      >
        {blockUserMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : "Block"}
      </Button>
    </div>
  );
};
