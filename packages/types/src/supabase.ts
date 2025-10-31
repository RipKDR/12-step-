// Generated TypeScript types from supabase_recovery_app_schema.sql
// This file contains all database types and Zod schemas for the Recovery Companion app

import { z } from 'zod';

// ========== Database Types ==========

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          handle: string | null;
          display_name: string | null;
          timezone: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          handle?: string | null;
          display_name?: string | null;
          timezone?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          handle?: string | null;
          display_name?: string | null;
          timezone?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      steps: {
        Row: {
          id: string;
          program: 'NA' | 'AA';
          step_number: number;
          title: string;
          prompts: StepPrompt[];
          created_at: string;
        };
        Insert: {
          id?: string;
          program: 'NA' | 'AA';
          step_number: number;
          title: string;
          prompts?: StepPrompt[];
          created_at?: string;
        };
        Update: {
          id?: string;
          program?: 'NA' | 'AA';
          step_number?: number;
          title?: string;
          prompts?: StepPrompt[];
          created_at?: string;
        };
      };
      step_entries: {
        Row: {
          id: string;
          user_id: string;
          step_id: string;
          version: number;
          content: Record<string, any>;
          is_shared_with_sponsor: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          step_id: string;
          version?: number;
          content?: Record<string, any>;
          is_shared_with_sponsor?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          step_id?: string;
          version?: number;
          content?: Record<string, any>;
          is_shared_with_sponsor?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          cravings_intensity: number | null;
          feelings: string[] | null;
          triggers: Trigger[] | null;
          coping_actions: CopingAction[] | null;
          gratitude: string | null;
          commitments: string[] | null;
          notes: string | null;
          is_shared_with_sponsor: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_date: string;
          cravings_intensity?: number | null;
          feelings?: string[] | null;
          triggers?: Trigger[] | null;
          coping_actions?: CopingAction[] | null;
          gratitude?: string | null;
          commitments?: string[] | null;
          notes?: string | null;
          is_shared_with_sponsor?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_date?: string;
          cravings_intensity?: number | null;
          feelings?: string[] | null;
          triggers?: Trigger[] | null;
          coping_actions?: CopingAction[] | null;
          gratitude?: string | null;
          commitments?: string[] | null;
          notes?: string | null;
          is_shared_with_sponsor?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      craving_events: {
        Row: {
          id: string;
          user_id: string;
          occurred_at: string;
          intensity: number | null;
          trigger_type: string | null;
          lat: number | null;
          lng: number | null;
          notes: string | null;
          response_taken: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          occurred_at?: string;
          intensity?: number | null;
          trigger_type?: string | null;
          lat?: number | null;
          lng?: number | null;
          notes?: string | null;
          response_taken?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          occurred_at?: string;
          intensity?: number | null;
          trigger_type?: string | null;
          lat?: number | null;
          lng?: number | null;
          notes?: string | null;
          response_taken?: string | null;
          created_at?: string;
        };
      };
      action_plans: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          situation: string | null;
          if_then: IfThenPair[];
          checklist: ChecklistItem[];
          emergency_contacts: EmergencyContact[];
          is_shared_with_sponsor: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          situation?: string | null;
          if_then?: IfThenPair[];
          checklist?: ChecklistItem[];
          emergency_contacts?: EmergencyContact[];
          is_shared_with_sponsor?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          situation?: string | null;
          if_then?: IfThenPair[];
          checklist?: ChecklistItem[];
          emergency_contacts?: EmergencyContact[];
          is_shared_with_sponsor?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      routines: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          schedule: RoutineSchedule;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          schedule: RoutineSchedule;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          schedule?: RoutineSchedule;
          active?: boolean;
          created_at?: string;
        };
      };
      routine_logs: {
        Row: {
          id: string;
          routine_id: string;
          user_id: string;
          run_at: string;
          status: 'sent' | 'completed' | 'skipped' | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          routine_id: string;
          user_id: string;
          run_at?: string;
          status?: 'sent' | 'completed' | 'skipped' | null;
          note?: string | null;
        };
        Update: {
          id?: string;
          routine_id?: string;
          user_id?: string;
          run_at?: string;
          status?: 'sent' | 'completed' | 'skipped' | null;
          note?: string | null;
        };
      };
      sobriety_streaks: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string | null;
          relapse_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_date: string;
          end_date?: string | null;
          relapse_note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_date?: string;
          end_date?: string | null;
          relapse_note?: string | null;
          created_at?: string;
        };
      };
      sponsor_relationships: {
        Row: {
          id: string;
          sponsor_id: string;
          sponsee_id: string;
          status: 'pending' | 'active' | 'revoked';
          created_at: string;
        };
        Insert: {
          id?: string;
          sponsor_id: string;
          sponsee_id: string;
          status?: 'pending' | 'active' | 'revoked';
          created_at?: string;
        };
        Update: {
          id?: string;
          sponsor_id?: string;
          sponsee_id?: string;
          status?: 'pending' | 'active' | 'revoked';
          created_at?: string;
        };
      };
      trigger_locations: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          lat: number;
          lng: number;
          radius_m: number;
          on_enter: string[];
          on_exit: string[];
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          lat: number;
          lng: number;
          radius_m?: number;
          on_enter?: string[];
          on_exit?: string[];
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          lat?: number;
          lng?: number;
          radius_m?: number;
          on_enter?: string[];
          on_exit?: string[];
          active?: boolean;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          recipient_id: string;
          content_ciphertext: string;
          nonce: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id?: string;
          sender_id: string;
          recipient_id: string;
          content_ciphertext: string;
          nonce?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          sender_id?: string;
          recipient_id?: string;
          content_ciphertext?: string;
          nonce?: string | null;
          created_at?: string;
        };
      };
      notification_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          platform: 'ios' | 'android' | 'web' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          platform?: 'ios' | 'android' | 'web' | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          platform?: 'ios' | 'android' | 'web' | null;
          created_at?: string;
        };
      };
      risk_signals: {
        Row: {
          id: string;
          user_id: string;
          scored_at: string;
          score: number;
          inputs: Record<string, any>;
        };
        Insert: {
          id?: string;
          user_id: string;
          scored_at?: string;
          score: number;
          inputs?: Record<string, any>;
        };
        Update: {
          id?: string;
          user_id?: string;
          scored_at?: string;
          score?: number;
          inputs?: Record<string, any>;
        };
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          meta: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          meta?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          meta?: Record<string, any>;
          created_at?: string;
        };
      };
    };
  };
}

// ========== Type Aliases ==========

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Step = Database['public']['Tables']['steps']['Row'];
export type StepEntry = Database['public']['Tables']['step_entries']['Row'];
export type DailyEntry = Database['public']['Tables']['daily_entries']['Row'];
export type CravingEvent = Database['public']['Tables']['craving_events']['Row'];
export type ActionPlan = Database['public']['Tables']['action_plans']['Row'];
export type Routine = Database['public']['Tables']['routines']['Row'];
export type RoutineLog = Database['public']['Tables']['routine_logs']['Row'];
export type SobrietyStreak = Database['public']['Tables']['sobriety_streaks']['Row'];
export type SponsorRelationship = Database['public']['Tables']['sponsor_relationships']['Row'];
export type TriggerLocation = Database['public']['Tables']['trigger_locations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type NotificationToken = Database['public']['Tables']['notification_tokens']['Row'];
export type RiskSignal = Database['public']['Tables']['risk_signals']['Row'];
export type AuditLog = Database['public']['Tables']['audit_log']['Row'];

// ========== Complex Types ==========

export interface StepPrompt {
  id: string;
  text: string;
  hint?: string;
}

export interface Trigger {
  type: string;
  note: string;
}

export interface CopingAction {
  action: string;
  duration_min: number;
}

export interface IfThenPair {
  if: string;
  then: string;
}

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface RoutineSchedule {
  type: 'daily' | 'weekly';
  hour?: number;
  minute?: number;
  days?: number[]; // 0-6 for Sunday-Saturday
  rrule?: string; // For complex schedules
}

// ========== Zod Schemas ==========

export const StepPromptSchema = z.object({
  id: z.string(),
  text: z.string(),
  hint: z.string().optional(),
});

export const TriggerSchema = z.object({
  type: z.string(),
  note: z.string(),
});

export const CopingActionSchema = z.object({
  action: z.string(),
  duration_min: z.number(),
});

export const IfThenPairSchema = z.object({
  if: z.string(),
  then: z.string(),
});

export const ChecklistItemSchema = z.object({
  label: z.string(),
  done: z.boolean(),
});

export const EmergencyContactSchema = z.object({
  name: z.string(),
  phone: z.string(),
});

export const RoutineScheduleSchema = z.object({
  type: z.enum(['daily', 'weekly']),
  hour: z.number().optional(),
  minute: z.number().optional(),
  days: z.array(z.number().min(0).max(6)).optional(),
  rrule: z.string().optional(),
});

export const ProfileSchema = z.object({
  user_id: z.string().uuid(),
  handle: z.string().nullable(),
  display_name: z.string().nullable(),
  timezone: z.string(),
  avatar_url: z.string().url().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const StepSchema = z.object({
  id: z.string().uuid(),
  program: z.enum(['NA', 'AA']),
  step_number: z.number().min(1).max(12),
  title: z.string(),
  prompts: z.array(StepPromptSchema),
  created_at: z.string(),
});

export const StepEntrySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  step_id: z.string().uuid(),
  version: z.number(),
  content: z.record(z.any()),
  is_shared_with_sponsor: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const DailyEntrySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  entry_date: z.string(),
  cravings_intensity: z.number().min(0).max(10).nullable(),
  feelings: z.array(z.string()).nullable(),
  triggers: z.array(TriggerSchema).nullable(),
  coping_actions: z.array(CopingActionSchema).nullable(),
  gratitude: z.string().nullable(),
  commitments: z.array(z.string()).nullable(),
  notes: z.string().nullable(),
  is_shared_with_sponsor: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CravingEventSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  occurred_at: z.string(),
  intensity: z.number().min(0).max(10).nullable(),
  trigger_type: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  notes: z.string().nullable(),
  response_taken: z.string().nullable(),
  created_at: z.string(),
});

export const ActionPlanSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  situation: z.string().nullable(),
  if_then: z.array(IfThenPairSchema),
  checklist: z.array(ChecklistItemSchema),
  emergency_contacts: z.array(EmergencyContactSchema),
  is_shared_with_sponsor: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const RoutineSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  schedule: RoutineScheduleSchema,
  active: z.boolean(),
  created_at: z.string(),
});

export const RoutineLogSchema = z.object({
  id: z.string().uuid(),
  routine_id: z.string().uuid(),
  user_id: z.string().uuid(),
  run_at: z.string(),
  status: z.enum(['sent', 'completed', 'skipped']).nullable(),
  note: z.string().nullable(),
});

export const SobrietyStreakSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string().nullable(),
  relapse_note: z.string().nullable(),
  created_at: z.string(),
});

export const SponsorRelationshipSchema = z.object({
  id: z.string().uuid(),
  sponsor_id: z.string().uuid(),
  sponsee_id: z.string().uuid(),
  status: z.enum(['pending', 'active', 'revoked']),
  created_at: z.string(),
});

export const TriggerLocationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  label: z.string(),
  lat: z.number(),
  lng: z.number(),
  radius_m: z.number(),
  on_enter: z.array(z.string()),
  on_exit: z.array(z.string()),
  active: z.boolean(),
  created_at: z.string(),
});

export const NotificationTokenSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  token: z.string(),
  platform: z.enum(['ios', 'android', 'web']).nullable(),
  created_at: z.string(),
});

// ========== Input/Output Types ==========

export type CreateProfileInput = z.infer<typeof ProfileSchema>['Insert'];
export type UpdateProfileInput = z.infer<typeof ProfileSchema>['Update'];

export type CreateStepEntryInput = z.infer<typeof StepEntrySchema>['Insert'];
export type UpdateStepEntryInput = z.infer<typeof StepEntrySchema>['Update'];

export type CreateDailyEntryInput = z.infer<typeof DailyEntrySchema>['Insert'];
export type UpdateDailyEntryInput = z.infer<typeof DailyEntrySchema>['Update'];

export type CreateCravingEventInput = z.infer<typeof CravingEventSchema>['Insert'];

export type CreateActionPlanInput = z.infer<typeof ActionPlanSchema>['Insert'];
export type UpdateActionPlanInput = z.infer<typeof ActionPlanSchema>['Update'];

export type CreateRoutineInput = z.infer<typeof RoutineSchema>['Insert'];
export type UpdateRoutineInput = z.infer<typeof RoutineSchema>['Update'];

export type CreateRoutineLogInput = z.infer<typeof RoutineLogSchema>['Insert'];

export type CreateSobrietyStreakInput = z.infer<typeof SobrietyStreakSchema>['Insert'];
export type UpdateSobrietyStreakInput = z.infer<typeof SobrietyStreakSchema>['Update'];

export type CreateSponsorRelationshipInput = z.infer<typeof SponsorRelationshipSchema>['Insert'];
export type UpdateSponsorRelationshipInput = z.infer<typeof SponsorRelationshipSchema>['Update'];

export type CreateTriggerLocationInput = z.infer<typeof TriggerLocationSchema>['Insert'];
export type UpdateTriggerLocationInput = z.infer<typeof TriggerLocationSchema>['Update'];

export type CreateNotificationTokenInput = z.infer<typeof NotificationTokenSchema>['Insert'];

// ========== Utility Types ==========

export type Program = 'NA' | 'AA';
export type RelationshipStatus = 'pending' | 'active' | 'revoked';
export type RoutineStatus = 'sent' | 'completed' | 'skipped';
export type Platform = 'ios' | 'android' | 'web';

// ========== API Response Types ==========

export interface WeeklySummary {
  week_start: string;
  week_end: string;
  avg_cravings: number;
  total_entries: number;
  completed_routines: number;
  total_routines: number;
  top_feelings: string[];
  top_triggers: string[];
}

export interface SobrietyStats {
  current_streak_days: number;
  longest_streak_days: number;
  total_relapses: number;
  start_date: string;
  is_active: boolean;
}

export interface SponsorCode {
  code: string;
  expires_at: string;
}

export interface SharedContent {
  step_entries: (StepEntry & { step: Step })[];
  daily_entries: DailyEntry[];
  action_plans: ActionPlan[];
}

// ========== Export All ==========

export * from './index';