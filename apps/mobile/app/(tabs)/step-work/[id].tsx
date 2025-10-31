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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, ActionButton, ChipSelector } from '@repo/ui';
import { trpc } from '../../../lib/trpc';

const stepEntrySchema = z.object({
  content: z.record(z.string(), z.any()),
});

type StepEntryForm = z.infer<typeof stepEntrySchema>;

export default function StepWorkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: step, isLoading: stepLoading } = trpc.steps.getById.useQuery(
    { id: id! },
    { enabled: !!id }
  );
  
  const { data: existingEntries } = trpc.steps.getUserEntries.useQuery();
  const { data: userProfile } = trpc.users.getProfile.useQuery();

  const createEntry = trpc.steps.createEntry.useMutation();
  const updateEntry = trpc.steps.updateEntry.useMutation();

  const existingEntry = existingEntries?.find(entry => entry.step_id === id);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StepEntryForm>({
    resolver: zodResolver(stepEntrySchema),
    defaultValues: {
      content: existingEntry?.content || {},
    },
  });

  const watchedContent = watch('content');

  const onSubmit = async (data: StepEntryForm) => {
    if (!id) return;

    try {
      setIsSubmitting(true);

      if (existingEntry) {
        await updateEntry.mutateAsync({
          id: existingEntry.id,
          content: data.content,
        });
      } else {
        await createEntry.mutateAsync({
          stepId: id,
          content: data.content,
        });
      }

      Alert.alert(
        'Success',
        'Your step work has been saved.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Step entry error:', error);
      Alert.alert(
        'Error',
        'Unable to save your step work. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromptResponse = (promptId: string, response: string) => {
    setValue('content', {
      ...watchedContent,
      [promptId]: response,
    });
  };

  const handleChipSelection = (promptId: string, selectedValues: string[]) => {
    setValue('content', {
      ...watchedContent,
      [promptId]: selectedValues,
    });
  };

  if (stepLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading step...</Text>
      </View>
    );
  }

  if (!step) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Step not found</Text>
        <ActionButton
          title="Go Back"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.stepNumber}>Step {step.step_number}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepProgram}>{step.program}</Text>
          </View>

          <View style={styles.promptsContainer}>
            {step.prompts?.map((prompt, index) => (
              <View key={prompt.id || index} style={styles.promptCard}>
                <Text style={styles.promptTitle}>{prompt.title}</Text>
                <Text style={styles.promptDescription}>{prompt.description}</Text>

                {prompt.type === 'text' && (
                  <Controller
                    control={control}
                    name={`content.${prompt.id}`}
                    render={({ field: { onChange, value } }) => (
                      <FormInput
                        label="Your Response"
                        placeholder={prompt.placeholder || 'Share your thoughts...'}
                        value={value || ''}
                        onChangeText={onChange}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        accessibilityLabel={`Response to ${prompt.title}`}
                        accessibilityHint="Enter your response to this step work prompt"
                      />
                    )}
                  />
                )}

                {prompt.type === 'multiple_choice' && prompt.options && (
                  <ChipSelector
                    options={prompt.options.map((option, idx) => ({
                      id: `${prompt.id}-${idx}`,
                      label: option,
                      value: option,
                    }))}
                    selectedValues={watchedContent[prompt.id] || []}
                    onSelectionChange={(values) => handleChipSelection(prompt.id, values)}
                    label="Select all that apply"
                    multiSelect={true}
                    accessibilityLabel={`Multiple choice for ${prompt.title}`}
                    accessibilityHint="Select all options that apply to you"
                  />
                )}

                {prompt.type === 'single_choice' && prompt.options && (
                  <ChipSelector
                    options={prompt.options.map((option, idx) => ({
                      id: `${prompt.id}-${idx}`,
                      label: option,
                      value: option,
                    }))}
                    selectedValues={watchedContent[prompt.id] ? [watchedContent[prompt.id]] : []}
                    onSelectionChange={(values) => handleChipSelection(prompt.id, values[0] || '')}
                    label="Choose one"
                    multiSelect={false}
                    accessibilityLabel={`Single choice for ${prompt.title}`}
                    accessibilityHint="Select the option that best describes you"
                  />
                )}

                {prompt.type === 'scale' && (
                  <View style={styles.scaleContainer}>
                    <Text style={styles.scaleLabel}>Rate from 1-10</Text>
                    <View style={styles.scaleOptions}>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <ActionButton
                          key={num}
                          title={num.toString()}
                          variant={watchedContent[prompt.id] === num ? 'primary' : 'secondary'}
                          size="small"
                          onPress={() => handlePromptResponse(prompt.id, num.toString())}
                          style={styles.scaleButton}
                          accessibilityLabel={`Rate ${num} out of 10`}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <ActionButton
              title={existingEntry ? 'Update Entry' : 'Save Entry'}
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
              fullWidth
              accessibilityLabel={existingEntry ? 'Update step work entry' : 'Save step work entry'}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your responses are private unless you choose to share them with your sponsor.
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
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    marginBottom: 16,
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  stepProgram: {
    fontSize: 16,
    color: '#6b7280',
  },
  promptsContainer: {
    marginBottom: 24,
  },
  promptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
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
  promptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  promptDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  scaleContainer: {
    marginTop: 16,
  },
  scaleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  scaleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scaleButton: {
    minWidth: 40,
  },
  actions: {
    marginBottom: 24,
  },
  footer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  footerText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
