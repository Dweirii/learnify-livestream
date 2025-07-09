"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/trpc";
import { UserPreview } from "@/lib/types";
import { BlockButton } from "./block-button";
import { UnblockButton } from "./unblock-button";

interface BlockStatusButtonProps {
  user: UserPreview;
}

export function BlockStatusButton({ user }: BlockStatusButtonProps) {
  const { data: blockStatus, isLoading } = api.stream.isBlocked.useQuery({
    otherUserId: user.id,
  });

  if (isLoading) {
    return (
      <div className="w-full h-9 bg-muted animate-pulse rounded-md" />
    );
  }

  if (!blockStatus) {
    return null;
  }

  // إذا كان المستخدم الحالي حظر المستخدم الآخر
  if (blockStatus.blockedByMe) {
    return (
      <UnblockButton 
        userToUnblock={user} 
      />
    );
  }

  // إذا كان المستخدم الآخر حظر المستخدم الحالي، لا نعرض أي زر
  if (blockStatus.blockedByOther) {
    return null;
  }

  // إذا لم يكن هناك حظر، نعرض زر الحظر
  return (
    <BlockButton 
      userToBlock={user} 
    />
  );
} 