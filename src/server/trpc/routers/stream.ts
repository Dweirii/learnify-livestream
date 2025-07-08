// server/trpc/routers/stream.ts
import { z } from "zod";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { getSelf } from "@/lib/auth-service";
import { router, publicProcedure } from "../trpc";
import { Prisma } from "@prisma/client";

type RecommendedUser = {
  id: string;
  username: string | null;
  imageUrl: string | null;
  stream: {
    isLive: boolean;
    viewers: number;
  } | null;
};

export const streamRouter = router({
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
                {
                  NOT: {
                    blocking: {
                      some: { blockedId: userId },
                    },
                  },
                },
                {
                  NOT: {
                    blockedBy: {
                      some: { blockerId: userId },
                    },
                  },
                },
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
