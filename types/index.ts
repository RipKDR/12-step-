
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'participant' | 'sponsor';
  createdAt: Date;
  program?: 'NA' | 'AA';
}

export interface SponsorLink {
  id: string;
  participantId: string;
  sponsorId: string;
  status: 'pending' | 'active' | 'revoked';
  createdAt: Date;
}

export interface StepSection {
  id: string;
  title: string;
  order: number;
}

export interface Step {
  id: string; // e.g., '1', '2'
  program: 'NA' | 'AA';
  title: string;
  order: number;
  sections: StepSection[];
}

export interface Question {
  id: string;
  stepId: string;
  sectionId: string;
  order: number;
  prompt: string;
  helpText: string;
  responseType: 'longtext' | 'scale' | 'checkbox' | 'date';
}

export interface Response {
  id: string;
  userId: string;
  stepId: string;
  questionId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'submitted' | 'revised';
}

export interface Review {
  id: string;
  responseId: string;
  sponsorId: string;
  comment: string;
  createdAt: Date;
  disposition: 'approve' | 'revise';
  isAddressed?: boolean;
}

export interface JournalEntry {
  id: string;
  userId: string;
  mood: string;
  triggers: string[];
  cravingLevel: number; // 0-10
  note: string;
  createdAt: Date;
}

export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
}
