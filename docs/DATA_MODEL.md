# Data Model Overview

Core tables (see SQL for full DDL):
- `profiles(user_id, handle, timezone, ...)`
- `steps(program, step_number, title, prompts[])`
- `step_entries(user_id, step_id, version, content, is_shared_with_sponsor)`
- `daily_entries(user_id, entry_date, cravings_intensity, feelings[], triggers[], coping_actions[], share_with_sponsor)`
- `craving_events(user_id, occured_at, intensity, trigger_type, lat, lng, notes, response_taken)`
- `action_plans(user_id, title, situation, if_then[], checklist[], emergency_contacts[], is_shared_with_sponsor)`
- `routines(id, user_id, schedule, active)` + `routine_logs(...)`
- `sobriety_streaks(user_id, start_date, end_date)`
- `sponsor_relationships(sponsor_id, sponsee_id, status)`
- `trigger_locations(user_id, label, lat, lng, radius_m, on_enter[], on_exit[])`
- `messages(sender_id, recipient_id, content_ciphertext, nonce)`
- `notification_tokens(user_id, token, platform)`
- `risk_signals(user_id, scored_at, score, inputs)`
- `audit_log(user_id, action, meta)`

All tables have **RLS**:
- Users can read/write **only** their own rows.
- Sponsors can read **only** items explicitly shared **and** only while link is `active`.
