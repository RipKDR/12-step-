
import React, { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import ProgressBar from './ui/ProgressBar';
import Button from './ui/Button';
import { type Question, type Response as ResponseType } from '../types';

interface StepWizardProps {
  questions: Question[];
  responses: Map<string, ResponseType>; // questionId -> Response
  onSaveResponse: (questionId: string, text: string) => Promise<void>;
  onComplete: () => void;
}

const StepWizard: React.FC<StepWizardProps> = ({ questions, responses, onSaveResponse, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleResponseChange = React.useCallback(async (text: string) => {
    // Only save if there's a change
    if (text !== (responses.get(currentQuestion.id)?.text || '')) {
      setIsSaving(true);
      await onSaveResponse(currentQuestion.id, text);
      setIsSaving(false);
    }
  }, [currentQuestion.id, onSaveResponse, responses]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  if (!currentQuestion) {
      return <div>Loading questions...</div>
  }

  return (
    <div className="flex flex-col items-center space-y-8 w-full">
      <div className="w-full max-w-2xl">
        <ProgressBar value={progress} />
      </div>

      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        initialResponse={responses.get(currentQuestion.id)?.text || ''}
        onResponseChange={handleResponseChange}
        isSaving={isSaving}
      />

      <div className="flex justify-between w-full max-w-2xl">
        <Button onClick={handleBack} disabled={currentIndex === 0} variant="secondary">
          Back
        </Button>
        <Button onClick={handleNext}>
          {currentIndex === questions.length - 1 ? 'Finish Section' : 'Save & Next'}
        </Button>
      </div>
    </div>
  );
};

export default StepWizard;
