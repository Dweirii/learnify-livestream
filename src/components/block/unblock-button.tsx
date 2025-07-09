"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/trpc";
import { UserPreview } from "@/lib/types";
import { UserMinus } from "lucide-react";

interface UnblockButtonProps {
  userToUnblock: UserPreview;
}

export function UnblockButton({ userToUnblock }: UnblockButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const unblockMutation = api.stream.unblockUser.useMutation({
    onSuccess: () => {
      toast.success(`تم إلغاء حظر ${userToUnblock.username || "المستخدم"}`);
      // يمكن إضافة منطق إضافي هنا إذا لزم الأمر
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إلغاء الحظر");
    },
  });

  const handleUnblock = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await unblockMutation.mutateAsync({
        otherUserId: userToUnblock.id,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUnblock}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="w-full"
    >
      <UserMinus className="h-4 w-4 mr-2" />
      {isLoading ? "جاري إلغاء الحظر..." : "إلغاء الحظر"}
    </Button>
  );
} 