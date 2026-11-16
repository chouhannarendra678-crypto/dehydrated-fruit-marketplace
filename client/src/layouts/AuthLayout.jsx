import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-oat text-ink flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Back to Home Link */}
        <div className="mb-6 flex justify-start">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest/70 hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>

        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-forest text-oat-light flex items-center justify-center font-display font-bold text-lg shadow-2xs">
            <span>DF</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-forest">
            Dehydrated<span className="text-forest/75 font-normal">Fruits</span>
          </span>
        </Link>
        <p className="text-[11px] text-ink/65 uppercase tracking-wider font-semibold">
          Discover. Compare. Buy. Dehydrated.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-oat-card py-8 px-6 shadow-2xs rounded-xl sm:px-10 border border-forest/15">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
