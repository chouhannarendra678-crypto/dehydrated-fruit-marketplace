import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ className = '', placeholder = 'Search dehydrated fruits, mango, kiwi, sellers...' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative w-full ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-forest/60">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3.5 py-1.5 bg-oat-light/80 focus:bg-white border border-forest/20 hover:border-forest/40 focus:border-forest rounded-md text-xs tablet:text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-1 focus:ring-forest transition-all shadow-2xs"
        />
      </div>
    </form>
  );
};

export default SearchBar;

