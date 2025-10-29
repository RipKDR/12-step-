import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    // RLS in Supabase ensures users can only query their own profile
    // This is just returning user data from the JWT context for now.
    return { id: ctx.user.id, email: ctx.user.email };
  }),

  updateTimezone: protectedProcedure
    .input(z.object({ timezone: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log(`Updating timezone for user ${ctx.user.id} to ${input.timezone}`);
      // TODO: Logic to update user timezone in Supabase
      return { success: true };
    }),
});
