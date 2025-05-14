// ./ytclone/src/app/(public)/search/[query]/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import VideoCard from '@/components/VideoCard';
import { Video } from '@/types/youtube'; // Import the Video interface

interface SearchResultsPageProps {
  params: {
    query: string;
  };
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ params }) => {
  const { query } = params;
  const [videos, setVideos] = useState<Video[]>([]); // Use the imported Video interface
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch search results');
        }
        const data = await response.json();
        setVideos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading search results...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Results for "{decodeURIComponent(query)}"</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      {videos.length === 0 && (
        <div className="text-center text-gray-600">No videos found for your query.</div>
      )}
    </div>
  );
};

export default SearchResultsPage;