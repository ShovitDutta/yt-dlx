"use client";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import CookieModal from "./components/CookieModal";

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

const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        onSearch(searchQuery);
    };

    return (
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center">
                <input
                    type="text"
                    className="w-full px-4 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md focus:outline-none focus:shadow-outline" onClick={handleSearch}>
                    <FaSearch />
                </button>
            </div>
        </motion.div>
    );
};

const SearchResults = ({ searchResults, isLoading }: { searchResults: VideoType[]; isLoading: boolean }) => {
    return isLoading ? (
        <p className="text-white">Loading search results...</p>
    ) : (
        searchResults.length > 0 && (
            <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
                <h2 className="text-2xl font-bold mb-4 text-white">Search Results</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {searchResults.map(video => (
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
    );
};

const HomeFeed = ({ homeFeed, isLoading, onGetHomeFeed }: { homeFeed: VideoType[]; isLoading: boolean; onGetHomeFeed: () => void }) => {
    return isLoading ? (
        <p className="text-white">Loading home feed...</p>
    ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }}>
            <h2 className="text-2xl font-bold mb-4 text-white">Home Feed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {homeFeed.map(video => (
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
    );
};

export default function Home() {
    const [searchResults, setSearchResults] = useState<VideoType[]>([]);
    const [homeFeed, setHomeFeed] = useState<VideoType[]>([]);
    const [isHomeFeedLoading, setIsHomeFeedLoading] = useState(true);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
    const [cookies, setCookies] = useState<string | null>(localStorage.getItem("youtubeCookies"));

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

    const handleGetHomeFeed = useCallback(async () => {
        setIsHomeFeedLoading(true);
        try {
            const response = await fetch(`/api/Account/HomeFeed`, {
                headers: {
                    Cookie: cookies || "",
                },
            });
            const data = await response.json();
            setHomeFeed(data.result?.data?.Videos || []);
        } catch (error) {
            console.error("Error fetching home feed:", error);
        } finally {
            setIsHomeFeedLoading(false);
        }
    }, [cookies]);

    useEffect(() => {
        if (cookies) {
            handleGetHomeFeed();
        }
    }, [cookies, handleGetHomeFeed]);

    return (
        <div className="min-h-screen bg-gray-900 py-6 text-white">
            <div className="container mx-auto px-4">
                <SearchBar onSearch={handleSearch} />
                <SearchResults searchResults={searchResults} isLoading={isSearchLoading} />
                {cookies ? (
                    <HomeFeed homeFeed={homeFeed} isLoading={isHomeFeedLoading} onGetHomeFeed={handleGetHomeFeed} />
                ) : (
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline mb-4" onClick={() => setIsCookieModalOpen(true)}>
                        Enter YouTube Cookies
                    </button>
                )}
                <CookieModal isOpen={isCookieModalOpen} onClose={() => setIsCookieModalOpen(false)} onCookiesSubmit={handleCookieSubmit} />
            </div>
        </div>
    );
}
