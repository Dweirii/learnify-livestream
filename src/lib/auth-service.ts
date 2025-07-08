"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const getSelf = async () => {
  const self = await currentUser();

  if (!self || !self.username) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { externalUserId: self.id }, // ✅ بدل id
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};



export const getSelfByUsername = async (username: string) => {
  const self = await currentUser();

  if (!self || !self.username) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (self.username !== user.username) {
    throw new Error("Unauthorized");
  }

  return user;
};
