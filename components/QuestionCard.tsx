
import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { type Question } from '../types';
import Chip from './ui/Chip';

interface QuestionCardProps {
  question: Question;
  initialResponse: string;
  onResponseChange: (response: string) => void;
  isSaving: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, initialResponse, onResponseChange, isSaving }) => {
  const [text, setText] = useState(initialResponse);
  const debouncedText = useDebounce(text, 500); // 500ms debounce delay

  useEffect(() => {
    // This effect triggers the save operation in the parent component
    // when the debounced text changes.
    onResponseChange(debouncedText);
  }, [debouncedText, onResponseChange]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  
  const getSaveStatus = () => {
      if (isSaving) return <Chip text="Saving..." color="blue" />;
      if (debouncedText !== text) return <Chip text="Draft" color="gray" />;
      return <Chip text="Synced" color="green" />;
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg w-full max-w-2xl mx-auto transition-all">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase">
          Step {question.stepId} &ndash; Section {question.sectionId}
        </span>
        {getSaveStatus()}
      </div>
      <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-100">{question.prompt}</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{question.helpText}</p>

      <div className="relative">
        <label htmlFor={`response-${question.id}`} className="sr-only">Your Response</label>
        <textarea
          id={`response-${question.id}`}
          rows={10}
          value={text}
          onChange={handleTextChange}
          className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Your thoughts and feelings here..."
        />
        <div className="absolute bottom-3 right-3 text-xs text-slate-400 dark:text-slate-500">
          {text.length} characters
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
