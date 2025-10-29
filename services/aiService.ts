
import { type Response } from '../types';

const AI_FEATURE_ENABLED = true; // This acts as a feature flag

// This is a stub for calling a server-side Cloud Function.
// In a real app, this would make a fetch request to your function endpoint.
export const getReflectionSuggestions = async (prompt: string, previousAnswers: Partial<Response>[]): Promise<string[]> => {
  if (!AI_FEATURE_ENABLED) {
    console.log("AI feature is disabled.");
    return [];
  }

  console.log("Fetching AI suggestions for prompt:", prompt);
  console.log("Context from previous answers:", previousAnswers);

  // MOCK API CALL
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real implementation, you would post the prompt and context to your backend:
  /*
  const response = await fetch('/api/ai/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, context: previousAnswers }),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch AI suggestions');
  }
  const data = await response.json();
  return data.suggestions;
  */

  // Return mock data for the scaffold
  return [
    "How did this situation affect your self-esteem?",
    "What boundary could you set next time this happens?",
    "Who in your support network could you discuss this with?",
  ];
};

// This is a stub for calling a server-side Cloud Function to get a section summary.
export const getSectionSummary = async (sectionAnswers: Partial<Response>[]): Promise<string> => {
    if (!AI_FEATURE_ENABLED) {
    console.log("AI feature is disabled.");
    return "";
  }

  console.log("Fetching AI summary for answers:", sectionAnswers);

  // MOCK API CALL
  await new Promise(resolve => setTimeout(resolve, 1500));

  return "Based on your answers, a key theme appears to be the challenge of setting boundaries with family members. You've identified that feelings of guilt often prevent you from being honest about your needs, leading to resentment. A positive pattern is your growing willingness to pause before reacting.";
};
