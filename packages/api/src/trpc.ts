import { initTRPC, TRPCError, type inferAsyncReturnType } from '@trpc/server';
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
// FIX: Import User type for stronger typing in context
import { createClient, type User } from '@supabase/supabase-js';

// You can use any variable name you like.
// We use `createInnerTRPCContext` to avoid confusion with the outer context.
// But you can name it whatever you want.
// @see https://trpc.io/docs/server/context
// FIX: Replaced `any` with the specific `User` type for improved type safety.
export const createInnerTRPCContext = async (opts: { user: User | null }) => {
  return {
    user: opts.user,
    // If you need to use the service role key for some admin actions,
    // you can initialize a new Supabase client here.
    // Be careful with this!
  };
};

// @see https://trpc.io/docs/server/context
export const createTRPCContext = async (opts: { req: Request | any }) => {
  // This is a server-only Supabase client.
  // It's safe to use the service role key here.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Get the session from the authorization header
  const { data: { user } } = await supabase.auth.getUser(
      opts.req.headers.get("authorization")?.replace("Bearer ", "")
  );

  return await createInnerTRPCContext({
    user,
  });
};

// FIX: Define Context type using inferAsyncReturnType for proper type inference.
type Context = inferAsyncReturnType<typeof createTRPCContext>;

// FIX: Use the defined Context type when initializing tRPC.
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
