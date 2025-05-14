// ./ytclone/src/app/(public)/search/[query]/page.tsx

"use client"; // Keep the client directive

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Import useParams
import VideoCard from "@/components/VideoCard";
import { Video } from "@/types/youtube"; // Import the Video interface

// No need for the SearchResultsPageProps interface if not receiving params as a prop
// interface SearchResultsPageProps {
//   params: {
//     query: string;
//   };
// }

// The component function does not receive params as a prop
const SearchResultsPage: React.FC = () => {
  // Use the useParams hook to get the params object
  const params = useParams();
  // Access the query property directly from the object returned by useParams
  // The dynamic segment is named '[query]', so the property name is 'query'
  const query = params.query as string; // Cast to string for TypeScript

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Now you can use query obtained from useParams
    // Add a check to ensure query is available before fetching
    if (!query) {
      setLoading(false); // Stop loading if query is not available
      setError("Search query not found in parameters.");
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        // Use the query from useParams in the fetch URL
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch search results");
        }
        const data: Video[] = await response.json(); // Cast to Video[]
        setVideos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]); // Depend on query from useParams

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading search results...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">Error: {error}</div>;
  }

  // Also add a check for when videos array is empty after loading
  if (!loading && !error && videos.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">
        <h1 className="text-2xl font-bold mb-6">Search Results for "{decodeURIComponent(query)}"</h1>
        No videos found for your query.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Results for "{decodeURIComponent(query)}"</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default SearchResultsPage;
