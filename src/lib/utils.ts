import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { db } from "@/lib/db"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ✅ دالة مساعدة لإنشاء استعلامات استبعاد المستخدمين المحظورين
export function createBlockedUsersFilter(currentUserId: string) {
  return {
    AND: [
      // استبعاد المستخدمين الذين حظروا المستخدم الحالي
      {
        blocking: {
          none: {
            blockedId: currentUserId,
          },
        },
      },
      // استبعاد المستخدمين الذين حظرهم المستخدم الحالي
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

// ✅ دالة مساعدة لإنشاء استعلامات استبعاد المستخدمين المحظورين للمتابعين
export function createFollowedUsersBlockFilter(currentUserId: string) {
  return {
    following: createBlockedUsersFilter(currentUserId),
  };
}

// ✅ دالة مساعدة للتحقق من حالة الحظر بين مستخدمين
export async function checkIfBlocked(userAId: string, userBId: string) {
  const blockRecord = await db.block.findFirst({
    where: {
      OR: [
        // userA حظر userB
        {
          blockerId: userAId,
          blockedId: userBId,
        },
        // userB حظر userA
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

// ✅ دالة مساعدة للتحقق من حماية الملف الشخصي
export async function checkProfileAccess(currentUserId: string, targetUserId: string) {
  const blockStatus = await checkIfBlocked(currentUserId, targetUserId);
  
  // إذا كان المستخدم المستهدف حظر المستخدم الحالي، لا يمكن الوصول
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
