
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  setDoc,
  writeBatch,
  Timestamp,
  documentId,
} from 'firebase/firestore';
import { db } from './firebase';
import { FIRESTORE_COLLECTIONS } from '../constants/firestore';
import { STEP_ONE_SEED, STEP_ONE_QUESTIONS_SEED } from '../constants/steps';
import { type Step, type Question, type Response as ResponseType } from '../types';

// Data Fetching
export const getSteps = async (program: 'NA' | 'AA' = 'NA'): Promise<Step[]> => {
  if (!db) throw new Error("Firestore not initialized");
  const stepsCol = collection(db, FIRESTORE_COLLECTIONS.STEPS);
  const q = query(stepsCol, where('program', '==', program), orderBy('order'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Step));
};

export const getQuestionsForStep = async (stepId: string): Promise<Question[]> => {
  if (!db) throw new Error("Firestore not initialized");
  const questionsCol = collection(db, FIRESTORE_COLLECTIONS.QUESTIONS);
  const q = query(questionsCol, where('stepId', '==', stepId), orderBy('order'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
};

export const getResponsesForStep = async (userId: string, stepId: string): Promise<ResponseType[]> => {
    if (!db) throw new Error("Firestore not initialized");
    const responsesCol = collection(db, FIRESTORE_COLLECTIONS.RESPONSES);
    const q = query(responsesCol, where('userId', '==', userId), where('stepId', '==', stepId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate(),
        } as ResponseType;
    });
};

// Data Mutation
export const saveResponse = async (userId: string, stepId: string, questionId: string, text: string): Promise<ResponseType> => {
  if (!db) throw new Error("Firestore not initialized");
  
  const responsesCol = collection(db, FIRESTORE_COLLECTIONS.RESPONSES);
  const q = query(responsesCol, where('userId', '==', userId), where('questionId', '==', questionId));
  const querySnapshot = await getDocs(q);
  
  const now = new Date();
  let responseDoc;
  let responseData: Omit<ResponseType, 'id' | 'createdAt'> & { createdAt: Date | Timestamp };

  if (querySnapshot.empty) {
    // Create new response
    responseDoc = doc(responsesCol); // Auto-generate ID
    responseData = {
      userId,
      stepId,
      questionId,
      text,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
    };
  } else {
    // Update existing response
    responseDoc = querySnapshot.docs[0].ref;
    const existingData = querySnapshot.docs[0].data();
    responseData = {
      ...existingData,
      userId,
      stepId,
      questionId,
      text,
      updatedAt: now,
      status: 'draft',
    } as Omit<ResponseType, 'id'>;
  }
  
  await setDoc(responseDoc, responseData, { merge: true });

  return { 
      id: responseDoc.id, 
      ...responseData, 
      createdAt: responseData.createdAt instanceof Timestamp ? responseData.createdAt.toDate() : responseData.createdAt, 
      updatedAt: now 
  };
};


// Data Seeding Utility
export const seedInitialData = async () => {
  if (!db) {
    console.error("Firestore not initialized for seeding.");
    return;
  }
  
  const stepsCol = collection(db, FIRESTORE_COLLECTIONS.STEPS);
  const q = query(stepsCol, where(documentId(), '==', STEP_ONE_SEED.id));
  const existingStep = await getDocs(q);

  if (!existingStep.empty) {
    return;
  }

  console.log("Seeding initial Step 1 data...");
  try {
    const batch = writeBatch(db);

    // Seed Step 1
    const stepDocRef = doc(db, FIRESTORE_COLLECTIONS.STEPS, STEP_ONE_SEED.id);
    batch.set(stepDocRef, STEP_ONE_SEED);

    // Seed Step 1 Questions
    STEP_ONE_QUESTIONS_SEED.forEach(question => {
      const questionDocRef = doc(db, FIRESTORE_COLLECTIONS.QUESTIONS, question.id);
      batch.set(questionDocRef, question);
    });

    await batch.commit();
    console.log("Successfully seeded initial data.");
  } catch (error) {
    console.error("Error seeding initial data:", error);
  }
};
