"use client";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import { regions } from "@/lib/region";

interface VideoType {
  type: string;
  title: string;
  videoId: string;
  description: string;
  thumbnails: any[];
  authorId: string;
  authorName: string;
  authorThumbnails: any[];
  authorBadges: any[];
  authorUrl: string;
  viewCount: string;
  shortViewCount: string;
}

const SearchBar = ({ onSearch, region, setRegion }: { onSearch: (query: string) => void; region: string; setRegion: (region: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center">
        <input
          type="text"
          className="w-full px-4 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md focus:outline-none focus:shadow-outline"
          onClick={handleSearch}
        >
          <FaSearch />
        </button>
        <select
          className="ml-4 px-4 py-2 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {regions.map((region) => (
            <option key={region.code} value={region.name}>
              {region.name}
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  );
};

const SearchResults = ({ searchResults, isLoading }: { searchResults: VideoType[]; isLoading: boolean }) => {
  return (
    isLoading ? (
      <p className="text-white">Loading search results...</p>
    ) : (
    searchResults.length > 0 && (
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Search Results</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {searchResults.map((video) => (
            <motion.div key={video.videoId} className="bg-gray-800 rounded-md shadow-md p-4">
              {video.thumbnails && video.thumbnails.length > 0 ? (
                <Image src={video.thumbnails[0].url} alt={video.title} width={320} height={180} className="rounded-md mb-2" />
              ) : (
                <div className="w-full h-[180px] bg-gray-700 rounded-md mb-2" />
              )}
              <h3 className="text-lg font-semibold text-white">{video.title}</h3>
              <p className="text-gray-400">{video.authorName}</p>
              <p className="text-gray-400">{video.viewCount} views</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
    )
  );
};

const TrendingVideos = ({ trendingVideos, isLoading }: { trendingVideos: VideoType[]; isLoading: boolean }) => {
  return (
    isLoading ? (
      <p className="text-white">Loading trending videos...</p>
    ) : (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-white">Trending Videos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {trendingVideos.map((video) => (
          <div key={video.videoId} className="bg-gray-800 rounded-md shadow-md p-4">
            {video.thumbnails && video.thumbnails.length > 0 ? (
              <Image src={video.thumbnails[0].url} alt={video.title} width={320} height={180} className="rounded-md mb-2" />
            ) : (
              <div className="w-full h-[180px] bg-gray-700 rounded-md mb-2" />
            )}
            <h3 className="text-lg font-semibold text-white">{video.title}</h3>
            <p className="text-gray-400">{video.authorName}</p>
            <p className="text-gray-400">{video.viewCount} views</p>
          </div>
        ))}
      </div>
    </motion.div>
    )
  );
};

export default function Home() {
  const [searchResults, setSearchResults] = useState<VideoType[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<VideoType[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [region, setRegion] = useState("India");

  const handleSearch = useCallback(async (query: string) => {
    setIsSearchLoading(true);
    try {
      const response = await fetch(`/api/Search/Video/Multiple?query=${query}`);
      const data = await response.json();
      setSearchResults(data.result);
    } catch (error) {
      console.error("Error searching videos:", error);
    } finally {
      setIsSearchLoading(false);
    }
  }, []);

  const handleGetTrendingVideos = useCallback(async () => {
    setIsTrendingLoading(true);
    try {
      const response = await fetch(`/api/Trending?query=Trending in ${region}`);
      const data = await response.json();
      setTrendingVideos(data.result);
    } catch (error) {
      console.error("Error fetching trending videos:", error);
    } finally {
      setIsTrendingLoading(false);
    }
  }, [region]);

  useEffect(() => {
    handleGetTrendingVideos();
  }, [handleGetTrendingVideos]);

  return (
    <div className="min-h-screen bg-gray-900 py-6 text-white">
      <div className="container mx-auto px-4">
        <SearchBar onSearch={handleSearch} region={region} setRegion={setRegion} />
        <SearchResults searchResults={searchResults} isLoading={isSearchLoading} />
        <TrendingVideos trendingVideos={trendingVideos} isLoading={isTrendingLoading} />
      </div>
    </div>
  );
}
