// server/trpc/routers/stream.ts
import { z } from "zod";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { getSelf } from "@/lib/auth-service";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { roomService } from "@/lib/liveKit";
import { createBlockedUsersFilter } from "@/lib/utils";
import { UserPreview, UserWithStream, BlockStatus, PaginatedResponse } from "@/lib/types";

type RecommendedUser = UserWithStream;

export const streamRouter = router({
  blockUser: protectedProcedure
    .input(z.object({ otherUserId: z.string() }))
    .mutation(async ({ input }) => {
      const self = await getSelf();
      const blockerId = self.id;
      const blockedId = input.otherUserId;

      if (blockerId === blockedId) {
        throw new Error("You cannot block yourself.");
      }

      const userToBlock = await db.user.findUnique({
        where: { id: blockedId },
        select: { id: true, username: true, imageUrl: true },
      });

      if (!userToBlock) {
        throw new Error("User not found.");
      }

      const [block] = await db.$transaction([
        db.block.upsert({
          where: {
            blockedId_blockerId: { blockerId, blockedId },
          },
          create: { blockerId, blockedId },
          update: {},
          include: {
            blocked: {
              select: { id: true, username: true, imageUrl: true },
            },
          },
        }),
        db.follow.deleteMany({
          where: {
            OR: [
              {
                followerId: blockerId,
                followingId: blockedId,
              },
              {
                followerId: blockedId,
                followingId: blockerId,
              },
            ],
          },
        }),
      ]);

      try {
        if (roomService) {
          const roomName = `room:${blockerId}`;
          await roomService.removeParticipant(roomName, blockedId);
        }
      } catch (error) {
        console.error("LiveKit: Failed to remove participant on block", error);
        // continue anyway
      }

      return {
        id: block.blocked.id,
        username: block.blocked.username,
        imageUrl: block.blocked.imageUrl,
      };
    }),

  unblockUser: protectedProcedure
    .input(z.object({ otherUserId: z.string() }))
    .mutation(async ({ input }) => {
      const self = await getSelf();
      const blockerId = self.id;
      const blockedId = input.otherUserId;

      if (blockerId === blockedId) {
        throw new Error("You cannot unblock yourself.");
      }

      const userToUnblock = await db.user.findUnique({
        where: { id: blockedId },
        select: { id: true, username: true, imageUrl: true },
      });

      if (!userToUnblock) {
        throw new Error("User not found.");
      }

      const block = await db.block.findUnique({
        where: {
          blockedId_blockerId: { blockerId, blockedId },
        },
      });

      if (!block) {
        throw new Error("User is not blocked.");
      }

      await db.block.delete({
        where: {
          blockedId_blockerId: { blockerId, blockedId },
        },
      });

      return {
        id: userToUnblock.id,
        username: userToUnblock.username,
        imageUrl: userToUnblock.imageUrl,
      };
    }),

  isBlocked: protectedProcedure
    .input(z.object({ otherUserId: z.string() }))
    .query(async ({ input }) => {
      const self = await getSelf();
      const currentUserId = self.id;
      const otherUserId = input.otherUserId;

      const blockedByMe = await db.block.findUnique({
        where: {
          blockedId_blockerId: {
            blockerId: currentUserId,
            blockedId: otherUserId,
          },
        },
      });

      const blockedByOther = await db.block.findUnique({
        where: {
          blockedId_blockerId: {
            blockerId: otherUserId,
            blockedId: currentUserId,
          },
        },
      });

      const result: BlockStatus = {
        blockedByMe: !!blockedByMe,
        blockedByOther: !!blockedByOther,
        isBlocked: !!blockedByMe || !!blockedByOther,
      };
      
      return result;
    }),

  getBlockedUsers: protectedProcedure
    .input(z.object({ 
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const self = await getSelf();
      const currentUserId = self.id;
      const { limit, cursor } = input;

      const blockedUsers = await db.block.findMany({
        where: {
          blockerId: currentUserId,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          blocked: {
            select: {
              id: true,
              username: true,
              imageUrl: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (blockedUsers.length > limit) {
        const nextItem = blockedUsers.pop();
        nextCursor = nextItem?.id;
      }

      const result: PaginatedResponse<UserPreview> = {
        items: blockedUsers.map(block => ({
          id: block.blocked.id,
          username: block.blocked.username,
          imageUrl: block.blocked.imageUrl,
        })),
        nextCursor,
      };
      
      return result;
    }),
      
  getRecommendedUsers: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(24).default(10) }))
    .query(async ({ input }) => {
      let userId: string | null = null;

      try {
        const self = await getSelf();
        userId = self.id;
      } catch {
        console.log("Not authenticated");
      }

      const baseUsers = await db.user.findMany({
        select: {
          id: true,
          username: true,
          imageUrl: true,
          stream: {
            select: {
              isLive: true,
            },
          },
        },
        where: userId
          ? {
              AND: [
                { NOT: { id: userId } },
                {
                  NOT: {
                    followedBy: {
                      some: { followerId: userId },
                    },
                  },
                },
                createBlockedUsersFilter(userId),
              ],
            }
          : undefined,
        orderBy: [
          {
            stream: {
              isLive: Prisma.SortOrder.desc,
            },
          },
          {
            createdAt: Prisma.SortOrder.desc,
          },
        ],
        take: input.limit,
      });

      const usersWithViewers: RecommendedUser[] = await Promise.all(
        baseUsers.map(async (user) => {
          let viewers = 0;

          if (user.stream?.isLive) {
            const count = await redis.get<number>(`stream:${user.id}:viewers`);
            viewers = count ?? 0;
          }

          return {
            id: user.id,
            username: user.username,
            imageUrl: user.imageUrl,
            stream: user.stream
              ? {
                  isLive: user.stream.isLive,
                  viewers,
                }
              : null,
          };
        })
      );

      return usersWithViewers;
    }),
});
