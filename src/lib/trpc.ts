"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/trpc";
import superjson from "superjson";

export const api = createTRPCReact<AppRouter>();

export const transformer = superjson;
