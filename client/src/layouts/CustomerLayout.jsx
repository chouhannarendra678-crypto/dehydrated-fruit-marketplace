import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';

const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-oat text-ink">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 desktop:px-8 py-6 tablet:py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;

