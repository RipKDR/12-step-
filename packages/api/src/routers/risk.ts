import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { createClient } from '@supabase/supabase-js';
import { calculateRiskScore, RiskScoreInputs } from '../utils/riskScoring';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const riskRouter = router({
  // Calculate current risk score
  calculate: protectedProcedure
    .input(z.object({
      lookbackDays: z.number().min(1).max(30).default(7),
    }))
    .query(async ({ input, ctx }) => {
      const inputs: RiskScoreInputs = {
        userId: ctx.user.id,
        lookbackDays: input.lookbackDays,
      };

      const result = await calculateRiskScore(inputs);

      // Store risk signal in database
      await supabase.from('risk_signals').insert({
        user_id: ctx.user.id,
        score: result.score,
        inputs: {
          lookback_days: input.lookbackDays,
          factors: result.factors,
        },
      });

      return result;
    }),

  // Get risk score history
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(30),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await supabase
        .from('risk_signals')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('scored_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new Error(`Failed to fetch risk history: ${error.message}`);
      }

      return data || [];
    }),

  // Get current risk level summary
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const inputs: RiskScoreInputs = {
      userId: ctx.user.id,
      lookbackDays: 7,
    };

    const result = await calculateRiskScore(inputs);

    return {
      score: result.score,
      level: result.level,
      factors: result.factors,
      recommendations: result.recommendations,
      calculated_at: new Date().toISOString(),
    };
  }),
});

