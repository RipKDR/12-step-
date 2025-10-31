import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, Slider, ChipSelector, ActionButton } from '@repo/ui';
import { trpc } from '../../lib/trpc';
import { format } from 'date-fns';

const dailyEntrySchema = z.object({
  cravings_intensity: z.number().min(0).max(10),
  feelings: z.array(z.string()),
  triggers: z.array(z.string()),
  coping_actions: z.array(z.string()),
  gratitude: z.string().optional(),
  notes: z.string().optional(),
  share_with_sponsor: z.boolean().default(false),
});

type DailyEntryForm = z.infer<typeof dailyEntrySchema>;

const feelingOptions = [
  { id: 'anxious', label: 'Anxious', value: 'anxious' },
  { id: 'calm', label: 'Calm', value: 'calm' },
  { id: 'frustrated', label: 'Frustrated', value: 'frustrated' },
  { id: 'hopeful', label: 'Hopeful', value: 'hopeful' },
  { id: 'lonely', label: 'Lonely', value: 'lonely' },
  { id: 'grateful', label: 'Grateful', value: 'grateful' },
  { id: 'angry', label: 'Angry', value: 'angry' },
  { id: 'peaceful', label: 'Peaceful', value: 'peaceful' },
  { id: 'sad', label: 'Sad', value: 'sad' },
  { id: 'joyful', label: 'Joyful', value: 'joyful' },
  { id: 'overwhelmed', label: 'Overwhelmed', value: 'overwhelmed' },
  { id: 'confident', label: 'Confident', value: 'confident' },
];

const triggerOptions = [
  { id: 'stress', label: 'Stress', value: 'stress' },
  { id: 'boredom', label: 'Boredom', value: 'boredom' },
  { id: 'social', label: 'Social situations', value: 'social' },
  { id: 'work', label: 'Work pressure', value: 'work' },
  { id: 'relationships', label: 'Relationship issues', value: 'relationships' },
  { id: 'financial', label: 'Financial stress', value: 'financial' },
  { id: 'health', label: 'Health concerns', value: 'health' },
  { id: 'loneliness', label: 'Loneliness', value: 'loneliness' },
  { id: 'celebration', label: 'Celebration', value: 'celebration' },
  { id: 'sadness', label: 'Sadness', value: 'sadness' },
  { id: 'anger', label: 'Anger', value: 'anger' },
  { id: 'other', label: 'Other', value: 'other' },
];

const copingOptions = [
  { id: 'meeting', label: 'Attended a meeting', value: 'meeting' },
  { id: 'sponsor', label: 'Called sponsor', value: 'sponsor' },
  { id: 'prayer', label: 'Prayer/meditation', value: 'prayer' },
  { id: 'exercise', label: 'Exercise', value: 'exercise' },
  { id: 'reading', label: 'Read recovery literature', value: 'reading' },
  { id: 'breathing', label: 'Breathing exercises', value: 'breathing' },
  { id: 'walk', label: 'Went for a walk', value: 'walk' },
  { id: 'music', label: 'Listened to music', value: 'music' },
  { id: 'journal', label: 'Journaled', value: 'journal' },
  { id: 'friend', label: 'Called a friend', value: 'friend' },
  { id: 'hobby', label: 'Engaged in hobby', value: 'hobby' },
  { id: 'sleep', label: 'Got rest', value: 'sleep' },
];

export default function DailyScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: todayEntry, refetch } = trpc.daily.getByDate.useQuery({
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const createEntry = trpc.daily.create.useMutation();
  const updateEntry = trpc.daily.update.useMutation();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DailyEntryForm>({
    resolver: zodResolver(dailyEntrySchema),
    defaultValues: {
      cravings_intensity: 0,
      feelings: [],
      triggers: [],
      coping_actions: [],
      gratitude: '',
      notes: '',
      share_with_sponsor: false,
    },
  });

  const watchedFeelings = watch('feelings');
  const watchedTriggers = watch('triggers');
  const watchedCopingActions = watch('coping_actions');
  const watchedShareWithSponsor = watch('share_with_sponsor');

  React.useEffect(() => {
    if (todayEntry) {
      reset({
        cravings_intensity: todayEntry.cravings_intensity,
        feelings: todayEntry.feelings || [],
        triggers: todayEntry.triggers || [],
        coping_actions: todayEntry.coping_actions || [],
        gratitude: todayEntry.gratitude || '',
        notes: todayEntry.notes || '',
        share_with_sponsor: todayEntry.share_with_sponsor || false,
      });
      setIsEditing(true);
    }
  }, [todayEntry, reset]);

  const onSubmit = async (data: DailyEntryForm) => {
    try {
      setIsSubmitting(true);

      if (isEditing && todayEntry) {
        await updateEntry.mutateAsync({
          id: todayEntry.id,
          ...data,
        });
      } else {
        await createEntry.mutateAsync(data);
      }

      await refetch();
      Alert.alert(
        'Success',
        'Your daily entry has been saved.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Daily entry error:', error);
      Alert.alert(
        'Error',
        'Unable to save your daily entry. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChipSelection = (field: keyof DailyEntryForm, selectedValues: string[]) => {
    setValue(field, selectedValues as any);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Daily Entry</Text>
            <Text style={styles.subtitle}>
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </Text>
            {isEditing && (
              <Text style={styles.editingText}>Editing today's entry</Text>
            )}
          </View>

          <View style={styles.form}>
            {/* Cravings Intensity */}
            <Controller
              control={control}
              name="cravings_intensity"
              render={({ field: { onChange, value } }) => (
                <Slider
                  value={value}
                  onValueChange={onChange}
                  minimumValue={0}
                  maximumValue={10}
                  label="How strong are your cravings today?"
                  accessibilityLabel="Cravings intensity slider"
                  accessibilityHint="Rate your cravings from 0 (none) to 10 (very strong)"
                />
              )}
            />

            {/* Feelings */}
            <Controller
              control={control}
              name="feelings"
              render={({ field: { onChange } }) => (
                <ChipSelector
                  options={feelingOptions}
                  selectedValues={watchedFeelings}
                  onSelectionChange={onChange}
                  label="How are you feeling today?"
                  multiSelect={true}
                  maxSelections={5}
                  accessibilityLabel="Feelings selector"
                  accessibilityHint="Select all feelings that apply to you today"
                />
              )}
            />

            {/* Triggers */}
            <Controller
              control={control}
              name="triggers"
              render={({ field: { onChange } }) => (
                <ChipSelector
                  options={triggerOptions}
                  selectedValues={watchedTriggers}
                  onSelectionChange={onChange}
                  label="What triggered you today?"
                  multiSelect={true}
                  maxSelections={5}
                  accessibilityLabel="Triggers selector"
                  accessibilityHint="Select all triggers you experienced today"
                />
              )}
            />

            {/* Coping Actions */}
            <Controller
              control={control}
              name="coping_actions"
              render={({ field: { onChange } }) => (
                <ChipSelector
                  options={copingOptions}
                  selectedValues={watchedCopingActions}
                  onSelectionChange={onChange}
                  label="What helped you cope today?"
                  multiSelect={true}
                  maxSelections={5}
                  accessibilityLabel="Coping actions selector"
                  accessibilityHint="Select all coping strategies you used today"
                />
              )}
            />

            {/* Gratitude */}
            <Controller
              control={control}
              name="gratitude"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Gratitude"
                  placeholder="What are you grateful for today?"
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  accessibilityLabel="Gratitude entry"
                  accessibilityHint="Write what you're grateful for today"
                />
              )}
            />

            {/* Notes */}
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Additional Notes"
                  placeholder="Any other thoughts or reflections..."
                  value={value || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  accessibilityLabel="Additional notes"
                  accessibilityHint="Write any additional thoughts or reflections"
                />
              )}
            />

            {/* Share with Sponsor */}
            <View style={styles.shareSection}>
              <Text style={styles.shareLabel}>Share with Sponsor</Text>
              <ActionButton
                title={watchedShareWithSponsor ? 'Sharing with sponsor' : 'Share with sponsor'}
                variant={watchedShareWithSponsor ? 'primary' : 'secondary'}
                onPress={() => setValue('share_with_sponsor', !watchedShareWithSponsor)}
                size="small"
                accessibilityLabel={watchedShareWithSponsor ? 'Stop sharing with sponsor' : 'Share with sponsor'}
                accessibilityHint="Toggle whether to share this entry with your sponsor"
              />
            </View>

            {/* Submit Button */}
            <ActionButton
              title={isEditing ? 'Update Entry' : 'Save Entry'}
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
              fullWidth
              accessibilityLabel={isEditing ? 'Update daily entry' : 'Save daily entry'}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  editingText: {
    fontSize: 14,
    color: '#3b82f6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  form: {
    marginBottom: 24,
  },
  shareSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shareLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
});