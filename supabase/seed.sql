-- Recovery Companion App - Seed Data
-- Copyright-safe prompts for 12-Step programs (NA/AA)
-- Generated: 2025-01-27

-- ========== NA Steps (Narcotics Anonymous) ==========

INSERT INTO public.steps (id, program, step_number, title, prompts) VALUES
-- Step 1
('na-step-1', 'NA', 1, 'We admitted we were powerless over our addiction', 
 '[
   {"id": "powerlessness", "text": "Describe a time when you tried to control your addiction and it didn''t work", "hint": "Think about specific attempts to moderate or quit on your own"},
   {"id": "consequences", "text": "What negative consequences have resulted from your addiction?", "hint": "Consider impacts on relationships, work, health, finances"},
   {"id": "unmanageability", "text": "How has your life become unmanageable due to addiction?", "hint": "Think about areas where you''ve lost control or stability"}
 ]'::jsonb),

-- Step 2
('na-step-2', 'NA', 2, 'We came to believe that a Power greater than ourselves could restore us to sanity',
 '[
   {"id": "belief", "text": "What does a Higher Power mean to you?", "hint": "This can be anything greater than yourself - nature, the group, a spiritual concept"},
   {"id": "sanity", "text": "How would you define sanity in the context of recovery?", "hint": "Think about what healthy, balanced living looks like for you"},
   {"id": "restoration", "text": "What aspects of your life need to be restored?", "hint": "Consider relationships, self-care, purpose, peace of mind"}
 ]'::jsonb),

-- Step 3
('na-step-3', 'NA', 3, 'We made a decision to turn our will and our lives over to the care of God as we understood Him',
 '[
   {"id": "decision", "text": "What does turning your will over mean to you?", "hint": "Think about letting go of trying to control everything"},
   {"id": "trust", "text": "How can you practice trusting your Higher Power?", "hint": "Consider small daily acts of faith or surrender"},
   {"id": "care", "text": "What does being cared for by a Higher Power look like?", "hint": "Think about receiving guidance, strength, or peace"}
 ]'::jsonb),

-- Step 4
('na-step-4', 'NA', 4, 'We made a searching and fearless moral inventory of ourselves',
 '[
   {"id": "fearless", "text": "What fears might prevent you from being completely honest?", "hint": "Consider fear of judgment, shame, or consequences"},
   {"id": "inventory", "text": "List your character defects and how they''ve affected your life", "hint": "Be specific about patterns of behavior that cause problems"},
   {"id": "assets", "text": "What positive qualities do you possess?", "hint": "Don''t forget to acknowledge your strengths and good qualities"}
 ]'::jsonb),

-- Step 5
('na-step-5', 'NA', 5, 'We admitted to God, to ourselves, and to another human being the exact nature of our wrongs',
 '[
   {"id": "admission", "text": "What are you most afraid to admit to another person?", "hint": "Think about secrets or shameful behaviors you''ve kept hidden"},
   {"id": "exact", "text": "How can you be completely honest about your wrongs?", "hint": "Consider the difference between minimizing and being specific"},
   {"id": "healing", "text": "What do you hope to gain from this admission?", "hint": "Think about freedom, connection, and spiritual growth"}
 ]'::jsonb),

-- Step 6
('na-step-6', 'NA', 6, 'We were entirely ready to have God remove all these defects of character',
 '[
   {"id": "ready", "text": "What does being ''entirely ready'' mean to you?", "hint": "Consider the difference between wanting change and being willing to change"},
   {"id": "defects", "text": "Which character defects are you most ready to let go of?", "hint": "Think about patterns that no longer serve you"},
   {"id": "removal", "text": "How might your life change if these defects were removed?", "hint": "Imagine living without these limiting patterns"}
 ]'::jsonb),

-- Step 7
('na-step-7', 'NA', 7, 'We humbly asked Him to remove our shortcomings',
 '[
   {"id": "humble", "text": "What does humility mean to you in this context?", "hint": "Think about honest self-assessment and openness to help"},
   {"id": "asking", "text": "How do you ask your Higher Power for help?", "hint": "Consider prayer, meditation, or other spiritual practices"},
   {"id": "shortcomings", "text": "Which shortcomings are you asking to have removed?", "hint": "Be specific about what you want to change"}
 ]'::jsonb),

-- Step 8
('na-step-8', 'NA', 8, 'We made a list of all persons we had harmed, and became willing to make amends to them all',
 '[
   {"id": "list", "text": "Who have you harmed through your addiction?", "hint": "Include family, friends, colleagues, and strangers"},
   {"id": "willing", "text": "What does being willing to make amends mean?", "hint": "Consider the difference between willingness and readiness"},
   {"id": "harm", "text": "How have you harmed others?", "hint": "Think about both direct and indirect harm caused"}
 ]'::jsonb),

-- Step 9
('na-step-9', 'NA', 9, 'We made direct amends to such people wherever possible, except when to do so would injure them or others',
 '[
   {"id": "direct", "text": "What does making direct amends look like?", "hint": "Consider face-to-face apologies, restitution, changed behavior"},
   {"id": "possible", "text": "Which amends are possible to make directly?", "hint": "Think about people you can contact safely"},
   {"id": "injure", "text": "When might making amends cause more harm?", "hint": "Consider situations where contact could be harmful"}
 ]'::jsonb),

-- Step 10
('na-step-10', 'NA', 10, 'We continued to take personal inventory and when we were wrong promptly admitted it',
 '[
   {"id": "continued", "text": "How can you make self-inventory a daily practice?", "hint": "Consider regular reflection and self-assessment"},
   {"id": "promptly", "text": "What does promptly admitting wrongs mean to you?", "hint": "Think about immediate acknowledgment rather than delay"},
   {"id": "wrong", "text": "How do you recognize when you''re wrong?", "hint": "Consider signs like defensiveness, guilt, or others'' feedback"}
 ]'::jsonb),

-- Step 11
('na-step-11', 'NA', 11, 'We sought through prayer and meditation to improve our conscious contact with God as we understood Him',
 '[
   {"id": "sought", "text": "What does seeking conscious contact mean to you?", "hint": "Think about actively pursuing spiritual connection"},
   {"id": "prayer", "text": "How do you practice prayer in your daily life?", "hint": "Consider formal prayers, conversations, or expressions of gratitude"},
   {"id": "meditation", "text": "What forms of meditation work for you?", "hint": "Think about mindfulness, contemplation, or other quiet practices"}
 ]'::jsonb),

-- Step 12
('na-step-12', 'NA', 12, 'Having had a spiritual awakening as the result of these steps, we tried to carry this message to addicts',
 '[
   {"id": "awakening", "text": "What spiritual awakening have you experienced?", "hint": "Think about moments of clarity, peace, or connection"},
   {"id": "message", "text": "What message do you want to carry to others?", "hint": "Consider hope, experience, strength, and the possibility of recovery"},
   {"id": "service", "text": "How can you be of service to other addicts?", "hint": "Think about sharing your experience, sponsoring, or supporting others"}
 ]'::jsonb);

-- ========== AA Steps (Alcoholics Anonymous) ==========

INSERT INTO public.steps (id, program, step_number, title, prompts) VALUES
-- Step 1
('aa-step-1', 'AA', 1, 'We admitted we were powerless over alcohol',
 '[
   {"id": "powerless", "text": "Describe a time when you tried to control your drinking and it didn''t work", "hint": "Think about specific attempts to moderate or quit on your own"},
   {"id": "consequences", "text": "What negative consequences have resulted from your drinking?", "hint": "Consider impacts on relationships, work, health, finances"},
   {"id": "unmanageable", "text": "How has your life become unmanageable due to alcohol?", "hint": "Think about areas where you''ve lost control or stability"}
 ]'::jsonb),

-- Step 2
('aa-step-2', 'AA', 2, 'We came to believe that a Power greater than ourselves could restore us to sanity',
 '[
   {"id": "belief", "text": "What does a Higher Power mean to you?", "hint": "This can be anything greater than yourself - nature, the group, a spiritual concept"},
   {"id": "sanity", "text": "How would you define sanity in the context of recovery?", "hint": "Think about what healthy, balanced living looks like for you"},
   {"id": "restoration", "text": "What aspects of your life need to be restored?", "hint": "Consider relationships, self-care, purpose, peace of mind"}
 ]'::jsonb),

-- Step 3
('aa-step-3', 'AA', 3, 'We made a decision to turn our will and our lives over to the care of God as we understood Him',
 '[
   {"id": "decision", "text": "What does turning your will over mean to you?", "hint": "Think about letting go of trying to control everything"},
   {"id": "trust", "text": "How can you practice trusting your Higher Power?", "hint": "Consider small daily acts of faith or surrender"},
   {"id": "care", "text": "What does being cared for by a Higher Power look like?", "hint": "Think about receiving guidance, strength, or peace"}
 ]'::jsonb),

-- Step 4
('aa-step-4', 'AA', 4, 'We made a searching and fearless moral inventory of ourselves',
 '[
   {"id": "fearless", "text": "What fears might prevent you from being completely honest?", "hint": "Consider fear of judgment, shame, or consequences"},
   {"id": "inventory", "text": "List your character defects and how they''ve affected your life", "hint": "Be specific about patterns of behavior that cause problems"},
   {"id": "assets", "text": "What positive qualities do you possess?", "hint": "Don''t forget to acknowledge your strengths and good qualities"}
 ]'::jsonb),

-- Step 5
('aa-step-5', 'AA', 5, 'We admitted to God, to ourselves, and to another human being the exact nature of our wrongs',
 '[
   {"id": "admission", "text": "What are you most afraid to admit to another person?", "hint": "Think about secrets or shameful behaviors you''ve kept hidden"},
   {"id": "exact", "text": "How can you be completely honest about your wrongs?", "hint": "Consider the difference between minimizing and being specific"},
   {"id": "healing", "text": "What do you hope to gain from this admission?", "hint": "Think about freedom, connection, and spiritual growth"}
 ]'::jsonb),

-- Step 6
('aa-step-6', 'AA', 6, 'We were entirely ready to have God remove all these defects of character',
 '[
   {"id": "ready", "text": "What does being ''entirely ready'' mean to you?", "hint": "Consider the difference between wanting change and being willing to change"},
   {"id": "defects", "text": "Which character defects are you most ready to let go of?", "hint": "Think about patterns that no longer serve you"},
   {"id": "removal", "text": "How might your life change if these defects were removed?", "hint": "Imagine living without these limiting patterns"}
 ]'::jsonb),

-- Step 7
('aa-step-7', 'AA', 7, 'We humbly asked Him to remove our shortcomings',
 '[
   {"id": "humble", "text": "What does humility mean to you in this context?", "hint": "Think about honest self-assessment and openness to help"},
   {"id": "asking", "text": "How do you ask your Higher Power for help?", "hint": "Consider prayer, meditation, or other spiritual practices"},
   {"id": "shortcomings", "text": "Which shortcomings are you asking to have removed?", "hint": "Be specific about what you want to change"}
 ]'::jsonb),

-- Step 8
('aa-step-8', 'AA', 8, 'We made a list of all persons we had harmed, and became willing to make amends to them all',
 '[
   {"id": "list", "text": "Who have you harmed through your drinking?", "hint": "Include family, friends, colleagues, and strangers"},
   {"id": "willing", "text": "What does being willing to make amends mean?", "hint": "Consider the difference between willingness and readiness"},
   {"id": "harm", "text": "How have you harmed others?", "hint": "Think about both direct and indirect harm caused"}
 ]'::jsonb),

-- Step 9
('aa-step-9', 'AA', 9, 'We made direct amends to such people wherever possible, except when to do so would injure them or others',
 '[
   {"id": "direct", "text": "What does making direct amends look like?", "hint": "Consider face-to-face apologies, restitution, changed behavior"},
   {"id": "possible", "text": "Which amends are possible to make directly?", "hint": "Think about people you can contact safely"},
   {"id": "injure", "text": "When might making amends cause more harm?", "hint": "Consider situations where contact could be harmful"}
 ]'::jsonb),

-- Step 10
('aa-step-10', 'AA', 10, 'We continued to take personal inventory and when we were wrong promptly admitted it',
 '[
   {"id": "continued", "text": "How can you make self-inventory a daily practice?", "hint": "Consider regular reflection and self-assessment"},
   {"id": "promptly", "text": "What does promptly admitting wrongs mean to you?", "hint": "Think about immediate acknowledgment rather than delay"},
   {"id": "wrong", "text": "How do you recognize when you''re wrong?", "hint": "Consider signs like defensiveness, guilt, or others'' feedback"}
 ]'::jsonb),

-- Step 11
('aa-step-11', 'AA', 11, 'We sought through prayer and meditation to improve our conscious contact with God as we understood Him',
 '[
   {"id": "sought", "text": "What does seeking conscious contact mean to you?", "hint": "Think about actively pursuing spiritual connection"},
   {"id": "prayer", "text": "How do you practice prayer in your daily life?", "hint": "Consider formal prayers, conversations, or expressions of gratitude"},
   {"id": "meditation", "text": "What forms of meditation work for you?", "hint": "Think about mindfulness, contemplation, or other quiet practices"}
 ]'::jsonb),

-- Step 12
('aa-step-12', 'AA', 12, 'Having had a spiritual awakening as the result of these steps, we tried to carry this message to alcoholics',
 '[
   {"id": "awakening", "text": "What spiritual awakening have you experienced?", "hint": "Think about moments of clarity, peace, or connection"},
   {"id": "message", "text": "What message do you want to carry to others?", "hint": "Consider hope, experience, strength, and the possibility of recovery"},
   {"id": "service", "text": "How can you be of service to other alcoholics?", "hint": "Think about sharing your experience, sponsoring, or supporting others"}
 ]'::jsonb);

-- ========== Sample User Data (Development Only) ==========
-- Note: This would typically be created through the app, but included for testing

-- Create a sample user profile (this would normally be done via Supabase Auth)
-- INSERT INTO public.profiles (user_id, handle, display_name, timezone, avatar_url) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'testuser', 'Test User', 'America/New_York', null);

-- Sample sobriety streak
-- INSERT INTO public.sobriety_streaks (user_id, start_date, end_date, relapse_note) VALUES
-- ('00000000-0000-0000-0000-000000000001', '2024-01-01', null, null);

-- Sample action plan
-- INSERT INTO public.action_plans (user_id, title, situation, if_then, checklist, emergency_contacts, is_shared_with_sponsor) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'Stress Response Plan', 'When I feel overwhelmed or stressed',
--  '[{"if": "I feel like I need to use", "then": "Call my sponsor immediately"}, {"if": "I can''t reach my sponsor", "then": "Go to a meeting or call the crisis line"}]'::jsonb,
--  '[{"label": "Call sponsor", "done": false}, {"label": "Go to meeting", "done": false}, {"label": "Practice breathing", "done": false}]'::jsonb,
--  '[{"name": "Sponsor", "phone": "+1234567890"}, {"name": "Crisis Line", "phone": "1-800-273-8255"}]'::jsonb,
--  false);

-- Sample routine
-- INSERT INTO public.routines (user_id, title, description, schedule, active) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'Morning Meditation', 'Daily 10-minute meditation practice',
--  '{"type": "daily", "hour": 8, "minute": 0}'::jsonb, true);

-- Sample trigger location
-- INSERT INTO public.trigger_locations (user_id, label, lat, lng, radius_m, on_enter, on_exit, active) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'Old Bar District', 40.7128, -74.0060, 200,
--  '["show_plan", "notify_sponsor"]'::jsonb, '[]'::jsonb, true);

-- ========== Common Feelings and Triggers ==========
-- These can be used as suggestions in the UI

-- Common feelings for daily entries
-- Feelings: anxious, depressed, hopeful, grateful, angry, sad, excited, lonely, confident, scared, peaceful, frustrated, joyful, overwhelmed, calm, restless, content, worried, proud, ashamed

-- Common trigger types for craving events
-- Trigger types: location, people, stress, boredom, celebration, loneliness, anger, anxiety, social pressure, routine change, financial stress, relationship conflict, work pressure, health issues, memories, smells, sounds, times of day, weather, holidays

-- ========== Meeting Resources ==========
-- BMLT (Basic Meeting List Tool) API endpoints for NA meetings
-- AA Meeting Guide API endpoints for AA meetings
-- These would be configured in environment variables

-- BMLT Root URLs (examples):
-- NA: https://bmlt.sezf.org/main_server/
-- AA: https://meetingguide.org/api/v1/

-- ========== Crisis Resources ==========
-- Default crisis hotlines (configurable by region)
-- US: 988 (Suicide & Crisis Lifeline)
-- AU: 13 11 14 (Lifeline)
-- UK: 116 123 (Samaritans)
-- CA: 1-833-456-4566 (Crisis Services Canada)

-- ========== Accessibility Features ==========
-- Default settings for accessibility
-- Font size: normal, large, extra large
-- High contrast: off, on
-- Reduced motion: off, on
-- Screen reader: off, on
-- Touch targets: minimum 44x44 dp
-- Color contrast: WCAG AA compliant (4.5:1 for text, 3:1 for UI)

-- ========== Privacy Settings ==========
-- Default privacy settings
-- Share with sponsor: per-item basis
-- Data retention: user-controlled
-- Export format: JSON
-- Delete account: cascade delete all data
-- Analytics: anonymous only (no PII)
-- Location data: user-controlled, encrypted
-- Push notifications: opt-in
-- Background sync: enabled by default