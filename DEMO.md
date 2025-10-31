# 12-Step Recovery Companion - Demo Preview

This is a preview of the 12-Step Recovery Companion app, a privacy-first recovery tool for people working through NA/AA programs.

## 🎭 Demo Mode

The demo shows the core features of the app using mock data. No real data is stored or transmitted.

## 🚀 Quick Start

### Option 1: Web Preview (Recommended)
```bash
cd apps/mobile
npx expo start --web
```

### Option 2: Mobile Device
```bash
cd apps/mobile
npx expo start
```
Then scan the QR code with the Expo Go app on your phone.

## 📱 What You'll See

### Home Screen
- Personalized greeting with sobriety streak counter
- Quick action buttons for main features
- Recent activity feed
- Today's routines
- Emergency support card

### Daily Entry
- Cravings intensity slider (0-10)
- Feelings selector (anxious, calm, hopeful, etc.)
- Triggers tracking (stress, work, relationships, etc.)
- Coping actions (meeting, sponsor call, meditation, etc.)
- Gratitude journal
- Optional sponsor sharing

### Step Work
- List of all 12 steps (NA/AA)
- Progress tracking for each step
- Copyright-safe prompts and questions
- Versioned entries with sponsor sharing

### Action Plans
- If-then emergency plans
- Emergency contacts
- Checklist items
- Sponsor sharing options

### Profile & Settings
- Sponsor connection
- Privacy controls
- Data export/delete
- Meeting finder
- Support resources

## 🔒 Privacy Features

- **Row Level Security**: All data is protected by user-level permissions
- **Selective Sharing**: Choose exactly what to share with your sponsor
- **Data Control**: Export or delete your data anytime
- **No Service Keys**: Client never has access to admin functions
- **Optional Encryption**: Sensitive messages can be encrypted

## 🏗️ Architecture

- **Mobile**: Expo (React Native) with TypeScript
- **Web**: Next.js 14 with tRPC
- **Backend**: Supabase (Postgres + Auth + Storage)
- **State**: TanStack Query for data fetching
- **Forms**: React Hook Form + Zod validation
- **UI**: Custom components with accessibility focus

## 📊 Data Model

The app tracks:
- **Profiles**: User info, program choice (NA/AA), timezone
- **Step Entries**: Versioned responses to step prompts
- **Daily Entries**: Cravings, feelings, triggers, coping actions
- **Action Plans**: If-then emergency scenarios
- **Routines**: Scheduled tasks with completion tracking
- **Sponsor Relationships**: Code-based connections with selective sharing
- **Trigger Locations**: Geofenced areas with automatic actions
- **Messages**: Encrypted communication with sponsors

## 🎯 Key Features

### For Users
- Work through 12-step programs at your own pace
- Track daily recovery progress
- Create emergency action plans
- Connect with sponsors securely
- Find nearby meetings
- Export your data anytime

### For Sponsors
- Read-only access to shared content
- Track sponsee progress
- Receive notifications for urgent situations
- Secure messaging

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account (for full functionality)

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in Supabase credentials
4. Run migrations: `npx supabase db reset`
5. Start the app: `npm run dev`

### Project Structure
```
apps/
├── mobile/          # Expo React Native app
├── web/             # Next.js sponsor portal
packages/
├── api/             # tRPC routers
├── types/           # Zod schemas & TypeScript types
└── ui/              # Shared UI components
supabase/
├── migrations/      # Database schema
└── seed.sql         # Sample data
```

## 🔐 Security & Privacy

- **RLS by Default**: All tables have Row Level Security enabled
- **User-Controlled Sharing**: Sponsors only see explicitly shared content
- **No Service Keys on Client**: Server procedures handle sensitive operations
- **Optional E2E Encryption**: Use libsodium for sensitive messages
- **Data Portability**: Full export/delete capabilities
- **Anonymous Analytics**: PostHog with no PII collection

## 📱 Accessibility

- **WCAG 2.2 AA**: Compliant with accessibility standards
- **Large Touch Targets**: Minimum 44x44 dp for all interactive elements
- **Screen Reader Support**: Full VoiceOver/TalkBack compatibility
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user preferences

## 🌍 Internationalization

- **Multi-Timezone**: User timezone support
- **Regional Crisis Lines**: Configurable emergency numbers
- **Meeting Resources**: BMLT/AA integration for local meetings

## 📈 Analytics & Observability

- **Sentry**: Error tracking and performance monitoring
- **PostHog**: Anonymous usage analytics (no PII)
- **Feature Flags**: Optional Unleash integration

## 🚀 Deployment

### Mobile
- **Expo EAS**: Build and deploy to app stores
- **OTA Updates**: Push updates without app store approval

### Web
- **Vercel**: Deploy Next.js app with edge functions
- **Supabase**: Managed database and auth

## 🤝 Contributing

This is a demo/preview. For the full open-source version, see the main repository.

## 📄 License

This demo is for preview purposes only. The full app will be released under an open-source license.

## 🆘 Support

For questions about this demo or the full app:
- Create an issue in the repository
- Contact the development team

---

**Remember**: This is a demo with mock data. In the full app, all data would be stored securely in your personal Supabase database with full privacy controls.
