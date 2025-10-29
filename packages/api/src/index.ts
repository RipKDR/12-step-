import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";

export type AppRouter = typeof appRouter;

export { appRouter, createTRPCContext };
