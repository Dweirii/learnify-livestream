import { getSelf } from "@/lib/auth-service";

export async function createContext() {
    const self = await getSelf().catch(() => null);
    return {
        currentUser : self,
    };
}

export type Context = Awaited<ReturnType<typeof createContext>>;