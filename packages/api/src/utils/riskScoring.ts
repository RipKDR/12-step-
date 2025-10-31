/**
 * Risk Signal Scoring Algorithm
 * 
 * Analyzes user's recovery data to generate a risk score (0-100)
 * Higher scores indicate higher risk of relapse
 * 
 * Factors considered:
 * - Recent craving intensity (daily entries)
 * - Frequency of craving events
 * - Negative feelings (anxiety, depression, anger)
 * - Sobriety streak status
 * - Missing daily entries (disengagement)
 * - Recent trigger exposure
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface RiskScoreInputs {
  userId: string;
  lookbackDays?: number; // How many days to look back (default: 7)
}

export interface RiskScoreResult {
  score: number; // 0-100
  level: 'low' | 'moderate' | 'high' | 'critical';
  factors: {
    cravingIntensity: number;
    cravingFrequency: number;
    negativeFeelings: number;
    engagement: number;
    streakStatus: number;
    triggerExposure: number;
  };
  recommendations: string[];
}

// Negative feelings that indicate higher risk
const NEGATIVE_FEELINGS = [
  'anxious',
  'depressed',
  'angry',
  'frustrated',
  'lonely',
  'overwhelmed',
  'restless',
  'worried',
  'ashamed',
  'sad',
];

const POSITIVE_FEELINGS = [
  'hopeful',
  'grateful',
  'calm',
  'content',
  'confident',
  'peaceful',
  'joyful',
  'proud',
];

/**
 * Calculate risk score for a user
 */
export async function calculateRiskScore(
  inputs: RiskScoreInputs
): Promise<RiskScoreResult> {
  const lookbackDays = inputs.lookbackDays || 7;
  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

  // Get daily entries from last N days
  const { data: dailyEntries } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', inputs.userId)
    .gte('entry_date', lookbackDate.toISOString().split('T')[0])
    .order('entry_date', { ascending: false });

  // Get craving events from last N days
  const { data: cravingEvents } = await supabase
    .from('craving_events')
    .select('*')
    .eq('user_id', inputs.userId)
    .gte('occurred_at', lookbackDate.toISOString())
    .order('occurred_at', { ascending: false });

  // Get current sobriety streak
  const { data: streaks } = await supabase
    .from('sobriety_streaks')
    .select('*')
    .eq('user_id', inputs.userId)
    .is('end_date', null) // Active streak
    .order('start_date', { ascending: false })
    .limit(1);

  const activeStreak = streaks && streaks.length > 0 ? streaks[0] : null;
  const streakDays = activeStreak
    ? Math.floor(
        (new Date().getTime() - new Date(activeStreak.start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  // Calculate individual factor scores (0-100 each)
  const cravingIntensity = calculateCravingIntensityScore(
    dailyEntries || [],
    lookbackDays
  );
  const cravingFrequency = calculateCravingFrequencyScore(
    cravingEvents || [],
    lookbackDays
  );
  const negativeFeelings = calculateNegativeFeelingsScore(
    dailyEntries || [],
    lookbackDays
  );
  const engagement = calculateEngagementScore(
    dailyEntries || [],
    lookbackDays
  );
  const streakStatus = calculateStreakStatusScore(streakDays);
  const triggerExposure = calculateTriggerExposureScore(
    dailyEntries || [],
    cravingEvents || [],
    lookbackDays
  );

  // Weighted average
  // Higher weight on recent behavior and cravings
  const weights = {
    cravingIntensity: 0.25,
    cravingFrequency: 0.20,
    negativeFeelings: 0.15,
    engagement: 0.15,
    streakStatus: 0.10,
    triggerExposure: 0.15,
  };

  const score = Math.round(
    cravingIntensity * weights.cravingIntensity +
      cravingFrequency * weights.cravingFrequency +
      negativeFeelings * weights.negativeFeelings +
      engagement * weights.engagement +
      streakStatus * weights.streakStatus +
      triggerExposure * weights.triggerExposure
  );

  // Ensure score is between 0 and 100
  const finalScore = Math.max(0, Math.min(100, score));

  // Determine risk level
  const level =
    finalScore >= 80
      ? 'critical'
      : finalScore >= 60
      ? 'high'
      : finalScore >= 40
      ? 'moderate'
      : 'low';

  // Generate recommendations
  const recommendations = generateRecommendations({
    score: finalScore,
    level,
    cravingIntensity,
    cravingFrequency,
    negativeFeelings,
    engagement,
    streakStatus,
    triggerExposure,
    streakDays,
  });

  return {
    score: finalScore,
    level,
    factors: {
      cravingIntensity,
      cravingFrequency,
      negativeFeelings,
      engagement,
      streakStatus,
      triggerExposure,
    },
    recommendations,
  };
}

/**
 * Calculate craving intensity score (0-100)
 * Higher average craving intensity = higher risk
 */
function calculateCravingIntensityScore(
  entries: any[],
  days: number
): number {
  if (entries.length === 0) return 50; // Neutral if no data

  const intensities = entries
    .map((e) => e.cravings_intensity)
    .filter((v) => v !== null && v !== undefined);

  if (intensities.length === 0) return 50;

  const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
  // Scale 0-10 to 0-100
  return Math.round(avgIntensity * 10);
}

/**
 * Calculate craving frequency score (0-100)
 * More frequent cravings = higher risk
 */
function calculateCravingFrequencyScore(
  events: any[],
  days: number
): number {
  const frequency = events.length / days; // cravings per day
  // 0 cravings = 0 score, 2+ per day = 100 score
  return Math.min(100, Math.round(frequency * 50));
}

/**
 * Calculate negative feelings score (0-100)
 * More negative feelings = higher risk
 */
function calculateNegativeFeelingsScore(
  entries: any[],
  days: number
): number {
  if (entries.length === 0) return 50;

  let totalNegative = 0;
  let totalPositive = 0;
  let totalEntries = 0;

  for (const entry of entries) {
    const feelings = entry.feelings || [];
    if (feelings.length > 0) {
      totalEntries++;
      const negative = feelings.filter((f: string) =>
        NEGATIVE_FEELINGS.includes(f.toLowerCase())
      ).length;
      const positive = feelings.filter((f: string) =>
        POSITIVE_FEELINGS.includes(f.toLowerCase())
      ).length;

      totalNegative += negative;
      totalPositive += positive;
    }
  }

  if (totalEntries === 0) return 50;

  const negativeRatio = totalNegative / (totalNegative + totalPositive || 1);
  // Scale 0-1 ratio to 0-100 score
  return Math.round(negativeRatio * 100);
}

/**
 * Calculate engagement score (0-100)
 * Missing entries = disengagement = higher risk
 */
function calculateEngagementScore(entries: any[], days: number): number {
  const entryCount = entries.length;
  const engagementRatio = entryCount / days;
  // 100% engagement = 0 risk, 0% engagement = 100 risk
  return Math.round((1 - engagementRatio) * 100);
}

/**
 * Calculate streak status score (0-100)
 * Shorter streak = higher risk, but only if very new (< 30 days)
 */
function calculateStreakStatusScore(streakDays: number): number {
  if (streakDays >= 90) return 0; // Very low risk
  if (streakDays >= 30) return 20; // Low risk
  if (streakDays >= 7) return 40; // Moderate risk
  if (streakDays >= 1) return 60; // Higher risk
  return 80; // Very high risk (no active streak)
}

/**
 * Calculate trigger exposure score (0-100)
 * More triggers = higher risk
 */
function calculateTriggerExposureScore(
  entries: any[],
  events: any[],
  days: number
): number {
  // Count unique trigger types from entries
  const triggerTypes = new Set<string>();
  for (const entry of entries) {
    const triggers = entry.triggers || [];
    for (const trigger of triggers) {
      if (trigger.type) triggerTypes.add(trigger.type);
    }
  }

  // Count triggered craving events
  const triggeredEvents = events.filter((e) => e.trigger_type).length;

  const exposure = (triggerTypes.size * 10 + triggeredEvents * 5) / days;
  return Math.min(100, Math.round(exposure * 10));
}

/**
 * Generate recommendations based on risk factors
 */
function generateRecommendations(params: {
  score: number;
  level: string;
  cravingIntensity: number;
  cravingFrequency: number;
  negativeFeelings: number;
  engagement: number;
  streakStatus: number;
  triggerExposure: number;
  streakDays: number;
}): string[] {
  const recommendations: string[] = [];

  if (params.score >= 60) {
    recommendations.push('Consider reaching out to your sponsor or support network');
    recommendations.push('Review and activate your action plans');
    recommendations.push('Use the Support Card tools (breathing, grounding exercises)');
  }

  if (params.cravingIntensity >= 70) {
    recommendations.push('High craving intensity detected - use coping strategies from your action plans');
  }

  if (params.cravingFrequency >= 70) {
    recommendations.push('Frequent cravings noted - increase connection with support network');
    recommendations.push('Consider attending an additional meeting');
  }

  if (params.negativeFeelings >= 70) {
    recommendations.push('Consider talking to a counselor or therapist about negative feelings');
    recommendations.push('Practice gratitude exercises');
  }

  if (params.engagement < 30) {
    recommendations.push('Low engagement detected - consider setting daily logging reminders');
  }

  if (params.streakDays < 30) {
    recommendations.push('Early in recovery - extra vigilance recommended');
    recommendations.push('Attend meetings regularly and connect with your sponsor');
  }

  if (params.triggerExposure >= 70) {
    recommendations.push('High trigger exposure - review and avoid known trigger locations');
    recommendations.push('Update trigger locations if new ones identified');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue current recovery practices - things look stable');
  }

  return recommendations;
}

