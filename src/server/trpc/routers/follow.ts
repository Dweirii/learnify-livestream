import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "@/server/trpc/trpc";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";
import { redis } from "@/lib/redis";
import { getSelf } from "@/lib/auth-service";

export const followRouter = router({
  follow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.currentUser?.id;
      if (!currentUserId) throw new Error("Unauthorized");

      if (currentUserId === input.userId) {
        throw new Error("Cannot follow yourself");
      }

      // ✅ Rate Limit (5 محاولات كل 10 ثواني)
      const { success, remaining, resetTime } = await rateLimit(
        `follow:${currentUserId}`,
        5,
        10
      );

      if (!success) {
        throw new Error("Too many follow attempts. Please wait a few seconds.");
      }

      const existing = await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: input.userId,
          },
        },
      });

      if (existing) throw new Error("Already following");

      return await db.follow.create({
        data: {
          followerId: currentUserId,
          followingId: input.userId,
        },
        include: {
          following: true,
        },
      });
    }),

  unfollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.currentUser?.id;
      if (!currentUserId) throw new Error("Unauthorized");

      if (currentUserId === input.userId) {
        throw new Error("Cannot unfollow yourself");
      }

      const follow = await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: input.userId,
          },
        },
      });

      if (!follow) throw new Error("Not following this user");

      return await db.follow.delete({
        where: { id: follow.id },
        include: { following: true },
      });
    }),

  isFollowing: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.currentUser?.id;
      if (!currentUserId) return false;

      const follow = await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: input.userId,
          },
        },
      });

      return !!follow;
    }),

  getFollowedUsers: protectedProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.currentUser?.id;
    if (!currentUserId) throw new Error("Unauthorized");

    const follows = await db.follow.findMany({
      where: {
        followerId: currentUserId,
        following: {
          blocking: {
            none: {
              blockedId: currentUserId,
            },
          },
        },
      },
      include: {
        following: {
          include: {
            stream: {
              select: { 
                isLive: true,
                viewerCount: true,
              },
            },
          },
        },
      },
      orderBy: [
        { following: { stream: { isLive: "desc" } } },
        { createdAt: "desc" },
      ],
    });

    return follows;
  }),

  getFollowing: publicProcedure
    .input(z.object({ 
      userId: z.string(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      let currentUserId: string | null = null;
      
      try {
        const self = await getSelf();
        currentUserId = self.id;
      } catch {
        // Not authenticated, continue without currentUserId
      }

      const { limit, cursor, userId } = input;

      const follows = await db.follow.findMany({
        where: {
          followerId: userId,
          following: currentUserId ? {
            blocking: {
              none: {
                blockedId: currentUserId,
              },
            },
          } : undefined,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          following: {
            include: {
              stream: {
                select: {
                  isLive: true,
                  viewerCount: true,
                },
              },
            },
          },
        },
        orderBy: [
          { following: { stream: { isLive: "desc" } } },
          { createdAt: "desc" },
        ],
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (follows.length > limit) {
        const nextItem = follows.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: follows,
        nextCursor,
      };
    }),

  getFollowedUsersSidebar: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const currentUserId = ctx.currentUser?.id;
        if (!currentUserId) return [];

        const followedUsers = await db.follow.findMany({
          where: { 
            followerId: currentUserId,
            following: {
              blocking: {
                none: {
                  blockedId: currentUserId,
                },
              },
            },
          },
          take: 10, // Limit for sidebar
          include: {
            following: {
              select: {
                id: true,
                username: true,
                imageUrl: true,
                stream: {
                  select: {
                    isLive: true,
                    viewerCount: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { following: { stream: { isLive: "desc" } } },
            { createdAt: "desc" },
          ],
        });

        return followedUsers.map(follow => ({
          id: follow.following.id,
          username: follow.following.username,
          imageUrl: follow.following.imageUrl,
          stream: follow.following.stream ? {
            isLive: follow.following.stream.isLive,
            viewers: follow.following.stream.viewerCount,
          } : null,
        }));
      } catch (error) {
        console.error("GetFollowedUsersSidebar error:", error);
        return [];
      }
    }),
});
