
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StepWizard from '../components/StepWizard';
import { type Question, type Response as ResponseType } from '../types';
import { getQuestionsForStep, getResponsesForStep, saveResponse } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

const StepView: React.FC = () => {
  const { id: stepId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Map<string, ResponseType>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStepData = async () => {
      if (!stepId || !user) return;
      
      try {
        setLoading(true);
        const [fetchedQuestions, fetchedResponses] = await Promise.all([
          getQuestionsForStep(stepId),
          getResponsesForStep(user.uid, stepId),
        ]);

        const responsesMap = new Map<string, ResponseType>();
        fetchedResponses.forEach(response => {
          responsesMap.set(response.questionId, response);
        });
        
        setQuestions(fetchedQuestions);
        setResponses(responsesMap);
      } catch (error) {
        console.error("Error fetching step data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStepData();
  }, [stepId, user]);

  const handleSaveResponse = async (questionId: string, text: string) => {
    if (!stepId || !user) return;
    
    try {
      const updatedResponse = await saveResponse(user.uid, stepId, questionId, text);
      setResponses(prev => new Map(prev).set(questionId, updatedResponse));
    } catch (error) {
      console.error("Error saving response:", error);
    }
  };
  
  const handleComplete = () => {
      alert("Section complete! You'd be navigated to the next section or back to the step list.");
      navigate('/steps');
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-slate-500 dark:text-slate-400">Loading Step...</p>
        </div>
    );
  }

  if (!questions || questions.length === 0) {
      return (
        <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">No questions found for this step.</p>
        </div>
      );
  }

  return (
    <StepWizard
      questions={questions}
      responses={responses}
      onSaveResponse={handleSaveResponse}
      onComplete={handleComplete}
    />
  );
};

export default StepView;
