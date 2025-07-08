// src/app/(browse)/[username]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { FollowButton } from "@/components/flw-button";


interface UserPageProps {
  params: {
    username: string;
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const self = await getSelf();
  const user = await db.user.findUnique({
    where: {
      username: params.username,
    },
    include: {
      stream: true,
    },
  });

  if (!user || user.username !== params.username) {
    notFound();
  }

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 h-full">
        <div className="hidden md:block">
          <FollowButton userId={user.id} />
        </div>
      </div>
    </div>
  );
}