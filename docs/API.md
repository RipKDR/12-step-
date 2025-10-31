# API Documentation

## Overview

The Recovery Companion API is built with tRPC and provides type-safe endpoints for the mobile and web applications. All endpoints require authentication and use Row Level Security (RLS) for data protection.

## Base URL

- **Development**: `http://localhost:3000/api/trpc`
- **Production**: `https://your-app.vercel.app/api/trpc`

## Authentication

All API endpoints require authentication via NextAuth session. The API automatically extracts user information from the session context.

## API Structure

### Routers

- **User**: Profile management and authentication
- **Steps**: Step work entries and prompts
- **Daily**: Daily recovery logs
- **Plans**: Action plans and routines
- **Sponsor**: Sponsor relationships and sharing
- **Triggers**: Geofence trigger locations
- **Notifications**: Push notifications and preferences
- **Export**: Data export and deletion

## User Router

### `user.getProfile`
Get current user's profile information.

**Response:**
```typescript
{
  id: string;
  handle: string;
  timezone: string;
  avatar_url?: string;
  program: 'NA' | 'AA';
  created_at: string;
  updated_at: string;
}
```

### `user.updateProfile`
Update user profile information.

**Input:**
```typescript
{
  handle?: string;
  timezone?: string;
  avatar_url?: string;
  program?: 'NA' | 'AA';
}
```

## Steps Router

### `steps.getAll`
Get all available steps for the user's program.

**Response:**
```typescript
Array<{
  id: string;
  program: 'NA' | 'AA';
  step_number: number;
  title: string;
  prompts: string[];
}>
```

### `steps.getEntries`
Get user's step entries.

**Input:**
```typescript
{
  stepId?: string;
  limit?: number;
  offset?: number;
}
```

**Response:**
```typescript
Array<{
  id: string;
  step_id: string;
  version: number;
  content: any;
  is_shared_with_sponsor: boolean;
  created_at: string;
  updated_at: string;
}>
```

### `steps.createEntry`
Create a new step entry.

**Input:**
```typescript
{
  stepId: string;
  content: any;
  isSharedWithSponsor?: boolean;
}
```

### `steps.updateEntry`
Update an existing step entry.

**Input:**
```typescript
{
  id: string;
  content?: any;
  isSharedWithSponsor?: boolean;
}
```

## Daily Router

### `daily.getEntries`
Get user's daily entries.

**Input:**
```typescript
{
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
```

**Response:**
```typescript
Array<{
  id: string;
  entry_date: string;
  cravings_intensity: number;
  feelings: string[];
  triggers: string[];
  coping_actions: string[];
  gratitude: string;
  notes: string;
  share_with_sponsor: boolean;
  created_at: string;
  updated_at: string;
}>
```

### `daily.createEntry`
Create a new daily entry.

**Input:**
```typescript
{
  entryDate: string;
  cravingsIntensity: number;
  feelings: string[];
  triggers: string[];
  copingActions: string[];
  gratitude: string;
  notes: string;
  shareWithSponsor?: boolean;
}
```

### `daily.updateEntry`
Update an existing daily entry.

**Input:**
```typescript
{
  id: string;
  cravingsIntensity?: number;
  feelings?: string[];
  triggers?: string[];
  copingActions?: string[];
  gratitude?: string;
  notes?: string;
  shareWithSponsor?: boolean;
}
```

## Plans Router

### `plans.getAll`
Get user's action plans.

**Response:**
```typescript
Array<{
  id: string;
  title: string;
  situation: string;
  if_then: Array<{
    condition: string;
    action: string;
  }>;
  emergency_contacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  is_shared_with_sponsor: boolean;
  created_at: string;
  updated_at: string;
}>
```

### `plans.create`
Create a new action plan.

**Input:**
```typescript
{
  title: string;
  situation: string;
  ifThen: Array<{
    condition: string;
    action: string;
  }>;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  isSharedWithSponsor?: boolean;
}
```

### `plans.update`
Update an existing action plan.

**Input:**
```typescript
{
  id: string;
  title?: string;
  situation?: string;
  ifThen?: Array<{
    condition: string;
    action: string;
  }>;
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  isSharedWithSponsor?: boolean;
}
```

## Sponsor Router

### `sponsor.getRelationships`
Get user's sponsor relationships.

**Response:**
```typescript
Array<{
  id: string;
  sponsor_id: string;
  sponsee_id: string;
  status: 'pending' | 'active' | 'revoked';
  created_at: string;
  updated_at: string;
}>
```

### `sponsor.createCode`
Generate a sponsor code for others to connect.

**Response:**
```typescript
{
  code: string;
  expires_at: string;
}
```

### `sponsor.connectWithCode`
Connect with a sponsor using their code.

**Input:**
```typescript
{
  code: string;
}
```

### `sponsor.getSharedContent`
Get content shared by sponsees (sponsor only).

**Input:**
```typescript
{
  sponseeId: string;
  contentType?: 'steps' | 'daily' | 'plans';
}
```

## Triggers Router

### `triggers.getAll`
Get user's trigger locations.

**Response:**
```typescript
Array<{
  id: string;
  label: string;
  lat: number;
  lng: number;
  radius_m: number;
  on_enter: string[];
  on_exit: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}>
```

### `triggers.create`
Create a new trigger location.

**Input:**
```typescript
{
  label: string;
  lat: number;
  lng: number;
  radiusM: number;
  onEnter: string[];
  onExit: string[];
  active?: boolean;
}
```

### `triggers.update`
Update an existing trigger location.

**Input:**
```typescript
{
  id: string;
  label?: string;
  lat?: number;
  lng?: number;
  radiusM?: number;
  onEnter?: string[];
  onExit?: string[];
  active?: boolean;
}
```

### `triggers.delete`
Delete a trigger location.

**Input:**
```typescript
{
  id: string;
}
```

## Notifications Router

### `notifications.registerToken`
Register a push notification token.

**Input:**
```typescript
{
  token: string;
  platform: 'ios' | 'android' | 'web';
}
```

### `notifications.send`
Send a push notification to a user.

**Input:**
```typescript
{
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | 'none';
  priority?: 'default' | 'normal' | 'high';
}
```

### `notifications.sendToSponsor`
Send a notification to a sponsor about their sponsee.

**Input:**
```typescript
{
  sponseeId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}
```

## Export Router

### `export.getUserData`
Export all user data.

**Response:**
```typescript
{
  profile: UserProfile;
  stepEntries: StepEntry[];
  dailyEntries: DailyEntry[];
  actionPlans: ActionPlan[];
  routines: Routine[];
  triggerLocations: TriggerLocation[];
  sponsorRelationships: SponsorRelationship[];
  exportDate: string;
}
```

### `export.deleteUserData`
Permanently delete all user data.

**Response:**
```typescript
{
  success: boolean;
  deletedAt: string;
}
```

## Error Handling

All API endpoints return standardized error responses:

```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General endpoints**: 100 requests per minute
- **Authentication**: 10 requests per minute
- **Notifications**: 20 requests per minute

## Webhooks

### Geofence Events
When a geofence event occurs, the system automatically:
1. Logs the event
2. Triggers relevant action plans
3. Notifies the sponsor (if enabled)

### Routine Reminders
Scheduled routine reminders are sent via:
1. Cron job every 2 hours
2. Push notifications to registered devices
3. Logged for tracking

## SDK Usage

### TypeScript/JavaScript

```typescript
import { trpc } from './lib/trpc';

// Get user profile
const profile = await trpc.user.getProfile.query();

// Create daily entry
const entry = await trpc.daily.createEntry.mutate({
  entryDate: '2024-01-01',
  cravingsIntensity: 3,
  feelings: ['anxious', 'hopeful'],
  triggers: ['work stress'],
  copingActions: ['called sponsor', 'went for walk'],
  gratitude: 'Grateful for another day sober',
  notes: 'Had a challenging day but stayed strong',
  shareWithSponsor: true,
});
```

### React Query Integration

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Query data
const { data: entries, isLoading } = useQuery({
  queryKey: ['daily-entries'],
  queryFn: () => trpc.daily.getEntries.query(),
});

// Mutate data
const createEntry = useMutation({
  mutationFn: (data) => trpc.daily.createEntry.mutate(data),
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries(['daily-entries']);
  },
});
```

## Testing

### Development Testing

```bash
# Test routine nudges cron
curl "http://localhost:3000/api/dev/test-cron?type=routine-nudges"

# Test weekly check-in cron
curl "http://localhost:3000/api/dev/test-cron?type=weekly-checkin"
```

### Production Testing

Use the tRPC playground at `/api/trpc` for interactive testing.

## Security

- All endpoints require authentication
- Row Level Security (RLS) enforces data access
- Input validation with Zod schemas
- Rate limiting prevents abuse
- Audit logging for security monitoring

## Support

For API support:
- **Email**: api-support@recoverycompanion.app
- **Documentation**: [Link to full docs]
- **Status Page**: [Link to status page]
