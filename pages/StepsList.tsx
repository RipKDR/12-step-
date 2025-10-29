
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from '../components/ui/ProgressBar';
import { getSteps, getQuestionsForStep, getResponsesForStep } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';
import { type Step } from '../types';

interface StepWithProgress extends Step {
  progress: number;
  answeredQuestions: number;
  totalQuestions: number;
}

const StepsList: React.FC = () => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<StepWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStepsAndProgress = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const baseSteps = await getSteps(); // Assuming program 'NA' for now
        
        if (baseSteps.length === 0) {
          // Handle case where data hasn't been seeded yet
          setLoading(false);
          return;
        }

        const stepsWithProgress = await Promise.all(
          baseSteps.map(async (step) => {
            const questions = await getQuestionsForStep(step.id);
            const responses = await getResponsesForStep(user.uid, step.id);
            
            const totalQuestions = questions.length;
            const answeredQuestions = responses.filter(r => r.text && r.text.trim() !== '').length;
            
            const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
            
            return {
              ...step,
              progress: Math.round(progress),
              answeredQuestions,
              totalQuestions
            };
          })
        );
        
        setSteps(stepsWithProgress);
      } catch (error) {
        console.error("Error fetching steps:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStepsAndProgress();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Steps</h1>
      {steps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <Link
              to={`/step/${step.id}`}
              key={step.id}
              className="block p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <div className="flex justify-between items-baseline">
                  <span className="text-5xl font-bold text-slate-300 dark:text-slate-600">{step.order}</span>
                   <span className="text-sm text-slate-500">{step.answeredQuestions} / {step.totalQuestions} questions</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Step {step.order}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate h-10">{step.title}</p>
              <ProgressBar value={step.progress} className="mt-4"/>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">No steps found.</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">The initial data may still be loading. Please wait a moment and refresh.</p>
        </div>
      )}
    </div>
  );
};

export default StepsList;
