"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api, transformer } from "@/lib/trpc"; // 👈 استدعينا transformer
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const trpcClient = api.createClient({
    links: [
      httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
      }),
    ],
  });

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </api.Provider>
  );
}
