"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/trpc";
import { UserPreview } from "@/lib/types";
import { UserX } from "lucide-react";

interface BlockButtonProps {
  userToBlock: UserPreview;
}

export function BlockButton({ userToBlock }: BlockButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const blockMutation = api.stream.blockUser.useMutation({
    onSuccess: () => {
      toast.success(`تم حظر ${userToBlock.username || "المستخدم"}`);
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء الحظر");
    },
  });

  const handleBlock = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await blockMutation.mutateAsync({
        otherUserId: userToBlock.id,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBlock}
      disabled={isLoading}
      variant="destructive"
      size="sm"
      className="w-full"
    >
      <UserX className="h-4 w-4 mr-2" />
      {isLoading ? "جاري الحظر..." : "حظر المستخدم"}
    </Button>
  );
} 