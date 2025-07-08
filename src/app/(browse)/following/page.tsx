import { getSelf } from "@/lib/auth-service";
import { redirect } from "next/navigation";
import { FollowingList } from "@/components/following-list";

export default async function FollowingPage() {
  const self = await getSelf();

  if (!self) {
    redirect("/sign-in");
  }

  return (
    <div className="h-full p-8 max-w-screen-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Following</h1>
        <p className="text-muted-foreground">
          Streams from creators you follow
        </p>
      </div>
      <FollowingList userId={self.id} />
    </div>
  );
}