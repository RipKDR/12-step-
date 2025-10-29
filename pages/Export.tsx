
import React from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/ui/Button';

const Export: React.FC = () => {
  const { stepId } = useParams();

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">Export Step {stepId}</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Generate a PDF of your work for this step. You can choose whether to include your sponsor's comments.
      </p>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <input id="include-comments" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label htmlFor="include-comments" className="ml-2 block text-sm text-slate-900 dark:text-slate-200">
              Include sponsor comments
            </label>
          </div>
        </div>
        <Button className="mt-8" size="lg">Generate PDF</Button>
      </div>
    </div>
  );
};

export default Export;
