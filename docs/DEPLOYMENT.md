# Deployment Guide

This guide covers deploying the Recovery Companion app to Vercel (web) and Expo EAS (mobile).

## Prerequisites

- Vercel account
- Expo account
- Supabase project
- Email service (for magic links)

## Web App Deployment (Vercel)

### 1. Prepare Environment Variables

Create a `.env.local` file in the `apps/web` directory with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
JWT_SECRET=your_jwt_secret

# Email (for magic links)
EMAIL_SERVER_HOST=smtp.your-provider.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email
EMAIL_SERVER_PASSWORD=your_password
EMAIL_FROM=noreply@your-domain.com

# Push Notifications
EXPO_PUSH_ACCESS_TOKEN=your_expo_push_token

# Cron Jobs
CRON_SECRET=your_cron_secret

# Optional: Analytics
POSTHOG_KEY=your_posthog_key
SENTRY_DSN=your_sentry_dsn
```

### 2. Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the project root:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add all variables from your `.env.local` file

### 3. Configure Custom Domain (Optional)

1. In Vercel dashboard, go to Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` to use your custom domain

## Mobile App Deployment (Expo EAS)

### 1. Install EAS CLI

```bash
npm install -g @expo/eas-cli
```

### 2. Login to Expo

```bash
eas login
```

### 3. Configure EAS

In the project root, run:

```bash
eas build:configure
```

This creates `eas.json` with build configurations.

### 4. Set Environment Variables

Create a `.env` file in the project root:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Expo
EXPO_PUBLIC_EAS_PROJECT_ID=your_eas_project_id

# Optional: Analytics
EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### 5. Build for Development

```bash
# iOS
eas build --platform ios --profile development

# Android
eas build --platform android --profile development
```

### 6. Build for Production

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

### 7. Submit to App Stores

```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

## Database Setup

### 1. Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 2. Seed Data

```bash
# Run seed script
supabase db seed
```

## Cron Jobs Configuration

The app includes two cron jobs:

1. **Routine Nudges** - Runs every 2 hours
   - Path: `/api/cron/routine-nudges`
   - Schedule: `0 */2 * * *`

2. **Weekly Check-in** - Runs every Monday at 9 AM
   - Path: `/api/cron/weekly-checkin`
   - Schedule: `0 9 * * 1`

These are automatically configured in `vercel.json` and will work once deployed.

## Testing Cron Jobs

In development, you can test cron jobs manually:

```bash
# Test routine nudges
curl "http://localhost:3000/api/dev/test-cron?type=routine-nudges"

# Test weekly check-in
curl "http://localhost:3000/api/dev/test-cron?type=weekly-checkin"
```

## Monitoring and Logs

### Vercel

- View function logs in Vercel dashboard
- Monitor cron job execution
- Set up alerts for failures

### Expo

- View build logs in Expo dashboard
- Monitor app performance
- Track crash reports

### Supabase

- Monitor database performance
- View query logs
- Set up alerts for errors

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Rotate keys regularly
3. **Database**: Use Row Level Security (RLS) policies
4. **Authentication**: Implement proper session management
5. **Cron Jobs**: Use secret tokens for authentication

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify dependencies
   - Check build logs

2. **Cron Job Failures**
   - Verify `CRON_SECRET` is set
   - Check function logs
   - Ensure database connections work

3. **Push Notification Issues**
   - Verify Expo Push tokens
   - Check notification permissions
   - Test with Expo Push Tool

4. **Database Connection Issues**
   - Verify Supabase credentials
   - Check RLS policies
   - Monitor connection limits

### Getting Help

- Check the logs in respective dashboards
- Review the documentation
- Contact support for the respective services

## Maintenance

### Regular Tasks

1. **Weekly**
   - Review cron job logs
   - Check app performance metrics
   - Monitor error rates

2. **Monthly**
   - Update dependencies
   - Review security settings
   - Backup database

3. **Quarterly**
   - Rotate API keys
   - Review access permissions
   - Update documentation

## Scaling Considerations

### Database
- Monitor connection limits
- Consider read replicas for heavy loads
- Implement connection pooling

### API
- Monitor function execution times
- Consider edge functions for global users
- Implement rate limiting

### Mobile
- Monitor app store reviews
- Track crash rates
- Update app regularly
