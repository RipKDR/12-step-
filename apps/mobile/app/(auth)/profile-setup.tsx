import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, ActionButton, ChipSelector } from '@repo/ui';
import { useAuth } from '../../hooks/useAuth';
import { trpc } from '../../lib/trpc';

const profileSchema = z.object({
  handle: z
    .string()
    .min(2, 'Handle must be at least 2 characters')
    .max(20, 'Handle must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores'),
  timezone: z.string().min(1, 'Please select your timezone'),
  program: z.enum(['NA', 'AA'], {
    required_error: 'Please select a program',
  }),
});

type ProfileForm = z.infer<typeof profileSchema>;

const timezoneOptions = [
  { id: 'utc', label: 'UTC', value: 'UTC' },
  { id: 'est', label: 'Eastern Time', value: 'America/New_York' },
  { id: 'cst', label: 'Central Time', value: 'America/Chicago' },
  { id: 'mst', label: 'Mountain Time', value: 'America/Denver' },
  { id: 'pst', label: 'Pacific Time', value: 'America/Los_Angeles' },
  { id: 'aest', label: 'Australian Eastern', value: 'Australia/Sydney' },
  { id: 'gmt', label: 'GMT', value: 'Europe/London' },
];

const programOptions = [
  { id: 'na', label: 'Narcotics Anonymous (NA)', value: 'NA' },
  { id: 'aa', label: 'Alcoholics Anonymous (AA)', value: 'AA' },
];

export default function ProfileSetupScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const createProfile = trpc.users.createProfile.useMutation();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      handle: '',
      timezone: '',
      program: undefined,
    },
  });

  const watchedProgram = watch('program');

  const onSubmit = async (data: ProfileForm) => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please sign in again.');
      return;
    }

    try {
      setIsLoading(true);
      
      await createProfile.mutateAsync({
        userId: user.id,
        handle: data.handle,
        timezone: data.timezone,
        program: data.program,
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Profile creation error:', error);
      Alert.alert(
        'Setup Error',
        'Unable to create your profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Help us personalize your recovery journey
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="handle"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Recovery Handle"
                  placeholder="Choose a unique handle"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.handle?.message}
                  autoCapitalize="none"
                  autoComplete="username"
                  required
                  helperText="This will be visible to your sponsor (if you choose to share)"
                  accessibilityLabel="Recovery handle"
                  accessibilityHint="Enter a unique handle for your recovery profile"
                />
              )}
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Program</Text>
              <Controller
                control={control}
                name="program"
                render={({ field: { onChange } }) => (
                  <ChipSelector
                    options={programOptions}
                    selectedValues={watchedProgram ? [watchedProgram] : []}
                    onSelectionChange={(values) => onChange(values[0])}
                    multiSelect={false}
                    accessibilityLabel="Recovery program"
                    accessibilityHint="Select your 12-step program"
                  />
                )}
              />
              {errors.program && (
                <Text style={styles.errorText}>{errors.program.message}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Timezone</Text>
              <Controller
                control={control}
                name="timezone"
                render={({ field: { onChange, value } }) => (
                  <ChipSelector
                    options={timezoneOptions}
                    selectedValues={value ? [value] : []}
                    onSelectionChange={(values) => onChange(values[0])}
                    multiSelect={false}
                    accessibilityLabel="Timezone"
                    accessibilityHint="Select your timezone for meeting times and reminders"
                  />
                )}
              />
              {errors.timezone && (
                <Text style={styles.errorText}>{errors.timezone.message}</Text>
              )}
            </View>

            <ActionButton
              title="Complete Setup"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              accessibilityLabel="Complete profile setup"
              accessibilityHint="Tap to finish setting up your recovery profile"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              You can update these settings later in your profile.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});