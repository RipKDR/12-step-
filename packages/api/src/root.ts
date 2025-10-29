import { router } from './trpc';
import { userRouter } from './routers/user';
// Placeholder routers
// import { stepRouter } from './routers/steps';
// import { dailyRouter } from './routers/daily';
// import { plansRouter } from './routers/plans';

export const appRouter = router({
  // FIX: Renaming 'user' to 'users' to avoid potential naming conflicts with
  // tRPC's internal hooks and properties (e.g., useQuery, useContext).
  users: userRouter,
  // step: stepRouter,
  // daily: dailyRouter,
  // plans: plansRouter,
});

export type AppRouter = typeof appRouter;