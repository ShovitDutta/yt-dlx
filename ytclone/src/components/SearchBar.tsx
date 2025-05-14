// ./ytclone/src/components/SearchBar.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search/${encodeURIComponent(query.trim())}`);
  };
  return (
    <form onSubmit={handleSearch} className="flex items-center justify-center w-full max-w-md mx-auto">
      <input
        required
        type="text"
        value={query}
        placeholder="Search YouTube"
        onChange={e => setQuery(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 flex-grow"
      />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        Search
      </button>
    </form>
  );
};
export default SearchBar;
