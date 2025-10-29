
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/onboarding');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
          12-Step Companion
        </Link>
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/steps" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Steps</Link>
              <Link to="/journal" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Journal</Link>
              <Link to="/profile" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Profile</Link>
              <Button onClick={handleSignOut} variant="secondary" size="sm">Sign Out</Button>
            </>
          ) : (
            <Button onClick={() => navigate('/onboarding')} variant="primary" size="sm">
              Get Started
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
