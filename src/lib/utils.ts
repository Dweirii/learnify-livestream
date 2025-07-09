import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { db } from "@/lib/db"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createBlockedUsersFilter(currentUserId: string) {
  return {
    AND: [
      {
        blocking: {
          none: {
            blockedId: currentUserId,
          },
        },
      },
      {
        blockedBy: {
          none: {
            blockerId: currentUserId,
          },
        },
      },
    ],
  };
}

export function createFollowedUsersBlockFilter(currentUserId: string) {
  return {
    following: createBlockedUsersFilter(currentUserId),
  };
}

export async function checkIfBlocked(userAId: string, userBId: string) {
  const blockRecord = await db.block.findFirst({
    where: {
      OR: [
        {
          blockerId: userAId,
          blockedId: userBId,
        },
        {
          blockerId: userBId,
          blockedId: userAId,
        },
      ],
    },
  });

  return {
    isBlocked: !!blockRecord,
    blockedByMe: blockRecord?.blockerId === userAId,
    blockedByOther: blockRecord?.blockerId === userBId,
  };
}

export async function checkProfileAccess(currentUserId: string, targetUserId: string) {
  const blockStatus = await checkIfBlocked(currentUserId, targetUserId);
  
  if (blockStatus.blockedByOther) {
    return {
      canAccess: false,
      reason: "blocked_by_target",
      blockStatus,
    };
  }

  return {
    canAccess: true,
    reason: "allowed",
    blockStatus,
  };
}
