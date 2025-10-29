
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Onboarding from '@/pages/Onboarding';
import StepsList from '@/pages/StepsList';
import StepView from '@/pages/StepView';
import SponsorReview from '@/pages/SponsorReview';
import Export from '@/pages/Export';
import Journal from '@/pages/Journal';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import Header from '@/components/layout/Header';
import { auth } from '@/services/firebase';
import { seedInitialData } from '@/services/firestoreService';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/onboarding" />;
};

const FirebaseErrorDisplay: React.FC = () => (
    <div className="flex items-center justify-center h-screen bg-red-50 dark:bg-slate-900 text-red-800 dark:text-red-200 p-8">
        <div className="text-center bg-white dark:bg-slate-800 p-10 rounded-lg shadow-2xl max-w-2xl border border-red-200 dark:border-red-800">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-2xl font-bold mt-4 text-slate-800 dark:text-slate-100">Firebase Configuration Error</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
                The application could not connect to Firebase. This is usually due to missing or incorrect configuration.
            </p>
            <div className="text-left bg-slate-50 dark:bg-slate-700 p-4 rounded-md mt-6 text-sm">
                <p className="font-semibold text-slate-700 dark:text-slate-200">Troubleshooting Steps:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-slate-600 dark:text-slate-300">
                    <li>Ensure you have a <code>.env.local</code> file in the root directory of your project.</li>
                    <li>Verify that the file contains all the required Firebase variables (e.g., <code>VITE_FIREBASE_API_KEY</code>).</li>
                    <li>Double-check that the values copied from your Firebase project console are correct and have no typos.</li>
                    <li>Restart your development server after creating or modifying the <code>.env.local</code> file.</li>
                </ol>
            </div>
            <p className="mt-4 text-xs text-slate-500">
                Check the browser's developer console for more specific error messages from the Firebase SDK.
            </p>
        </div>
    </div>
);


function App() {
  useEffect(() => {
    // On app startup, check if we need to seed the database with initial content.
    seedInitialData();
  }, []); // Empty dependency array ensures this runs only once.
  
  if (!auth) {
    return <FirebaseErrorDisplay />;
  }
  
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={<PrivateRoute><StepsList /></PrivateRoute>} />
              <Route path="/steps" element={<PrivateRoute><StepsList /></PrivateRoute>} />
              <Route path="/step/:id" element={<PrivateRoute><StepView /></PrivateRoute>} />
              <Route path="/review/:participantId/:stepId" element={<PrivateRoute><SponsorReview /></PrivateRoute>} />
              <Route path="/export/:stepId" element={<PrivateRoute><Export /></PrivateRoute>} />
              <Route path="/journal" element={<PrivateRoute><Journal /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Hash-router>
    </AuthProvider>
  );
}

export default App;
