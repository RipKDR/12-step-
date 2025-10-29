import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@repo/api";

// FIX: Removing explicit type annotation which did not solve the underlying issue
// and simplifying the createTRPCReact call. The root cause is likely a naming
// collision in the API router, which has been addressed there.
export const trpc = createTRPCReact<AppRouter>();