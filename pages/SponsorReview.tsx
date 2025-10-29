
import React from 'react';
import { useParams } from 'react-router-dom';

const SponsorReview: React.FC = () => {
  const { participantId, stepId } = useParams();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Sponsor Review</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        Reviewing Step <span className="font-semibold text-blue-600">{stepId}</span> for participant <span className="font-semibold text-blue-600">{participantId}</span>.
      </p>

      {/* This would be replaced with a list of questions and answers */}
      <div className="space-y-8">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Question: What does 'powerlessness' mean to you?</h2>
          <p className="mb-4 p-4 bg-slate-100 dark:bg-slate-700 rounded">
            The participant's answer would appear here... It means I can't control my first drink, and after that, all bets are off. My best intentions are useless once I start.
          </p>
          <h3 className="text-md font-semibold mb-2">Sponsor Comments</h3>
          {/* A component to display and add comments would go here */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
             <p className="text-sm text-slate-500">This is a great start. Can you think of a specific example of when your best intentions weren't enough?</p>
             <textarea className="w-full mt-2 p-2 border rounded bg-slate-50 dark:bg-slate-700" placeholder="Add your comment..."></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorReview;
