import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-20 h-20 rounded-2xl bg-forest/10 border border-forest/15 flex items-center justify-center text-forest font-display font-bold text-3xl mb-6 shadow-2xs">
        404
      </div>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-forest mb-2">Page Not Found</h1>
      <p className="text-sm text-ink/70 max-w-md mb-8 leading-relaxed">
        The dehydrated fruit page or resource you are looking for has been moved, removed, or does not exist.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          <Home className="w-4 h-4 mr-2" />
          Return to Marketplace Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
