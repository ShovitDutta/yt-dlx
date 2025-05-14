// ./ytclone/src/app/(public)/page.tsx

import SearchBar from '@/components/SearchBar';
import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to YouTubeDLX Player</h1>
      <SearchBar />
      {/* Optional: Section for popular/trending videos */}
    </div>
  );
};

export default HomePage;
