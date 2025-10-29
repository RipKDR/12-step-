import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { appRouter } from "@repo/api";
import { createTRPCContext } from "@repo/api/trpc";

/**
 * This wraps the `appRouter` and creates a tRPC handler.
 * @see https://trpc.io/docs/server/adapters
 */
const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
  });

export { handler as GET, handler as POST };
