// src/app/(browse)/[username]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { checkProfileAccess } from "@/lib/utils";
import { FollowButton } from "@/components/flw-button";
import { BlockStatusButton } from "@/components/block/block-status-button";


interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

// ✅ دالة generateMetadata لحماية الصفحة من الحظر
export async function generateMetadata({ params }: UserPageProps) {
  const { username } = await params;
  
  // ✅ الحصول على المستخدم الحالي
  let self;
  try {
    self = await getSelf();
  } catch {
    // المستخدم غير مسجل الدخول
  }

  const user = await db.user.findUnique({
    where: {
      username: username,
    },
    select: {
      id: true,
      username: true,
      imageUrl: true,
    },
  });

  if (!user || user.username !== username) {
    return {
      title: "المستخدم غير موجود",
    };
  }

  // ✅ التحقق من حالة الحظر إذا كان المستخدم مسجل الدخول
  if (self) {
    const accessCheck = await checkProfileAccess(self.id, user.id);
    
    // إذا كان المستخدم الآخر حظر المستخدم الحالي، نعرض 404
    if (!accessCheck.canAccess) {
      return {
        title: "المستخدم غير موجود",
      };
    }
  }

  return {
    title: `${user.username} - Learnify`,
    description: `ملف شخصي لـ ${user.username}`,
    openGraph: {
      title: `${user.username} - Learnify`,
      description: `ملف شخصي لـ ${user.username}`,
      images: [user.imageUrl],
    },
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;
  
  // ✅ الحصول على المستخدم الحالي
  let self;
  try {
    self = await getSelf();
  } catch {
    // المستخدم غير مسجل الدخول، يمكنه رؤية الملف الشخصي
  }

  const user = await db.user.findUnique({
    where: {
      username: username,
    },
    include: {
      stream: true,
    },
  });

  if (!user || user.username !== username) {
    notFound();
  }

  // ✅ التحقق من حالة الحظر إذا كان المستخدم مسجل الدخول
  if (self) {
    const accessCheck = await checkProfileAccess(self.id, user.id);
    
    // إذا كان المستخدم الآخر حظر المستخدم الحالي، نعرض 404
    if (!accessCheck.canAccess) {
      notFound();
    }
  }

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 h-full">
        <div className="hidden md:block">
          <FollowButton userId={user.id} />
          {self && (
            <BlockStatusButton user={user} />
          )}
        </div>
      </div>
    </div>
  );
}