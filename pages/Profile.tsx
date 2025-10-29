
import React from 'react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
    const { user } = useAuth();
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile & Settings</h1>
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
          <p><strong>Role:</strong> {user?.role || 'Not available'}</p>
          <p><strong>Program:</strong> {user?.program || 'Not set'}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
        <div className="space-y-4">
            <p className="text-slate-500 dark:text-slate-400">Export all your data, including responses and journal entries, as a JSON file.</p>
            <Button variant="secondary">Export My Data</Button>
            <hr className="dark:border-slate-700"/>
            <p className="text-red-500">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <Button variant="danger">Delete My Account</Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
