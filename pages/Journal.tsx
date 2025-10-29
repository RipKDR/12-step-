
import React from 'react';

const Journal: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Private Journal</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        This space is for you and you alone. It is not visible to your sponsor unless you explicitly share an entry.
      </p>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">New Entry</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="mood" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Today's Mood</label>
            <input type="text" id="mood" className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-700 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="craving" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Craving Level (0-10)</label>
            <input type="range" id="craving" min="0" max="10" className="mt-1 w-full" />
          </div>
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Note</label>
            <textarea id="note" rows={5} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 dark:bg-slate-700 sm:text-sm p-2"></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
