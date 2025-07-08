// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing Clerk Webhook Secret");
  }

  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 401 });
  }

  const eventType = evt.type;

  const externalId = payload.data.id;
  const username = payload.data.username;
  const imageUrl = payload.data.image_url;

  if (eventType === "user.created") {
    const existingUser = await db.user.findUnique({
      where: { externalUserId: externalId },
    });

    if (!existingUser) {
      await db.user.create({
        data: {
          externalUserId: externalId,
          username,
          imageUrl,
        },
      });
    }
  }

  if (eventType === "user.updated") {
    const existingUser = await db.user.findUnique({
      where: { externalUserId: externalId },
    });

    if (!existingUser) {
      await db.user.create({
        data: {
          externalUserId: externalId,
          username,
          imageUrl,
        },
      });
    } else {
      await db.user.update({
        where: { externalUserId: externalId },
        data: {
          username,
          imageUrl,
        },
      });
    }
  }

  if (eventType === "user.deleted") {
    await db.user.deleteMany({
      where: { externalUserId: externalId },
    });
  }

  return new Response("Webhook processed", { status: 200 });
}
