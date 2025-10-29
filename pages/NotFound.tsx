
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <p className="text-2xl font-semibold mt-4">Page Not Found</p>
      <p className="text-slate-500 mt-2">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link to="/" className="mt-6 inline-block bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition-colors">
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
