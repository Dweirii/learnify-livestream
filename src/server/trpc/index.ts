import { router } from "./trpc";
import { streamRouter } from "./routers/stream";
import { followRouter } from "./routers/follow";

export const appRouter = router({
    stream: streamRouter,
    follow: followRouter,
});

export type AppRouter = typeof appRouter;