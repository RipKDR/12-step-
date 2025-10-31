import { router } from './trpc';
import { userRouter } from './routers/user';
import { stepsRouter } from './routers/steps';
import { dailyRouter } from './routers/daily';
import { plansRouter } from './routers/plans';
import { routinesRouter } from './routers/routines';
import { sponsorRouter } from './routers/sponsor';
import { triggersRouter } from './routers/triggers';
import { notificationsRouter } from './routers/notifications';
import { exportRouter } from './routers/export';

export const appRouter = router({
  // FIX: Renaming 'user' to 'users' to avoid potential naming conflicts with
  // tRPC's internal hooks and properties (e.g., useQuery, useContext).
  users: userRouter,
  steps: stepsRouter,
  daily: dailyRouter,
  plans: plansRouter,
  routines: routinesRouter,
  sponsor: sponsorRouter,
  triggers: triggersRouter,
  notifications: notificationsRouter,
  export: exportRouter,
});

export type AppRouter = typeof appRouter;