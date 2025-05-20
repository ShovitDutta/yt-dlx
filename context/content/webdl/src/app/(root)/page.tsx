"use client";
import Image from "next/image";
import { regions } from "@/lib/region";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useCallback, useEffect, useMemo, memo, Fragment } from "react";
import { FaSearch, FaFire, FaHistory, FaThumbsUp, FaRegBookmark, FaMusic, FaGamepad, FaNewspaper, FaFilm, FaFutbol, FaGraduationCap, FaMicrochip } from "react-icons/fa";
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
interface VideoType {
    type: string;
    title: string;
    videoId: string;
    authorId: string;
    thumbnails: any[];
    authorUrl: string;
    viewCount: string;
    authorName: string;
    description: string;
    authorBadges: any[];
    shortViewCount: string;
    authorThumbnails: any[];
}
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const GlassCard = memo(({ children, className = "" }: { className?: string; children: React.ReactNode }) => (
    <div className={`bg-neutral-900 backdrop-blur-lg rounded-xl shadow-red-950 shadow-2xl border border-neutral-900/50 ${className}`}>{children}</div>
));
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const LoadingSpinner = memo(() => (
    <motion.div className="h-16 w-16 rounded-full border-t-4 border-red-500 border-opacity50" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
));
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const SearchBar = ({
    onSearch,
    region,
    setRegion,
    query,
    setQuery,
}: {
    region: string;
    onSearch: (query: string) => void;
    setRegion: (region: string) => void;
    query: string;
    setQuery: (query: string) => void;
}) => {
    const handleSearch = () => {
        if (query.trim()) onSearch(query);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
    };
    return (
        <motion.div className="mb-8 sticky top-0 z-50" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <GlassCard className="p-2 rounded-full border-2 border-red-800">
                <div className="flex items-center">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={query}
                            onKeyDown={handleKeyDown}
                            placeholder="Search videos..."
                            onChange={e => setQuery(e.target.value)}
                            className="w-full px-4 py-3 rounded-l-md bg-neutral-900/70 text-white border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <motion.button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4.5 px-5 rounded-r-md" onClick={handleSearch} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <FaSearch />
                    </motion.button>
                    <div className="ml-4">
                        <select
                            className="px-4 py-3 rounded-full bg-neutral-900/70 text-white border border-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                            value={region}
                            onChange={e => setRegion(e.target.value)}>
                            {regions.map(region => (
                                <option key={region.code} value={region.name}>
                                    {region.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const Sidebar = () => {
    return (
        <motion.div
            className="hidden md:block w-20 lg:w-56 fixed left-0 top-0 h-full border-r-2 border-red-800"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <GlassCard className="h-full py-8 px-2 lg:px-4">
                <div className="flex flex-col items-center lg:items-start gap-8">
                    <div className="flex items-center justify-center lg:justify-start w-full mb-6">
                        <motion.div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center animate-pulse" whileHover={{ scale: 1.1 }} />
                        <span className="hidden lg:block ml-2 text-xl font-bold text-white">YouTubeDLX</span>
                    </div>
                    <SidebarItem icon={<FaFire />} text="Trending" active /> <SidebarItem icon={<FaHistory />} text="History" /> <SidebarItem icon={<FaThumbsUp />} text="Liked" />
                    <SidebarItem icon={<FaRegBookmark />} text="Saved" />
                </div>
            </GlassCard>
        </motion.div>
    );
};
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const SidebarItem = memo(({ icon, text, active = false }: { text: string; active?: boolean; icon: React.ReactNode }) => {
    return (
        <motion.div className={`flex items-center w-full p-2 rounded-lg cursor-pointer ${active ? "bg-red-600/40" : "hover:bg-neutral-900/50"}`} whileHover={{ scale: 1.05 }}>
            <div className="text-xl text-orange-300 flex justify-center lg:justify-start w-full lg:w-auto">{icon}</div> <span className="hidden lg:block ml-3 text-orange-300">{text}</span>
        </motion.div>
    );
});
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const VideoCard = memo(({ video }: { video: VideoType }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <GlassCard className="overflow-hidden relative h-full border-2 border-red-950">
                <div className="relative">
                    {video.thumbnails && video.thumbnails.length > 0 ? (
                        <Fragment>
                            <Image src={video.thumbnails[0].url} alt={video.title} width={380} height={220} className="w-full rounded-t-xl object-cover" />
                            <motion.div className="absolute inset-0 bg-red-600/20" initial={{ opacity: 0 }} animate={{ opacity: isHovered ? 1 : 0 }} transition={{ duration: 0.3 }} />
                        </Fragment>
                    ) : (
                        <div className="w-full h-[220px] bg-neutral-900 rounded-t-xl" />
                    )}
                    <motion.div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white" initial={{ opacity: 0.6 }} whileHover={{ opacity: 1 }}>
                        {video.shortViewCount}
                    </motion.div>
                </div>
                <div className="p-4">
                    <div className="flex">
                        {video.authorThumbnails && video.authorThumbnails.length > 0 ? (
                            <div className="flex-shrink-0 mr-3">
                                <motion.div className="w-10 h-10 rounded-full overflow-hidden" whileHover={{ scale: 1.1 }}>
                                    <Image src={video.authorThumbnails[0].url} alt={video.authorName} width={40} height={40} className="object-cover" />
                                </motion.div>
                            </div>
                        ) : null}
                        <div>
                            <h3 className="text-lg font-semibold text-white line-clamp-2">{video.title}</h3> <p className="text-orange-400 mt-1">{video.authorName}</p>
                            <div className="flex items-center text-orange-500 text-sm mt-1">
                                <span>{video.viewCount} views</span>
                            </div>
                        </div>
                    </div>
                    <motion.div
                        className="mt-2 text-sm text-orange-400 line-clamp-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? "auto" : 0 }}
                        transition={{ duration: 0.3 }}>
                        {video.description}
                    </motion.div>
                </div>
            </GlassCard>
            {isHovered && (
                <motion.div
                    className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 p-3 bg-gradient-to-t from-neutral-900/90 to-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}>
                    <motion.button className="bg-neutral-900/80 hover:bg-neutral-900/80 p-2 rounded-full" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <FaThumbsUp className="text-white" />
                    </motion.button>
                    <motion.button className="bg-neutral-900/80 hover:bg-neutral-900/80 p-2 rounded-full" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <FaRegBookmark className="text-white" />
                    </motion.button>
                </motion.div>
            )}
        </motion.div>
    );
});
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const SearchResults = memo(({ searchResults, isLoading }: { isLoading: boolean; searchResults: VideoType[] }) => {
    return (
        <AnimatePresence>
            {isLoading && searchResults.length === 0 ? (
                <motion.div className="flex justify-center items-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <LoadingSpinner />
                </motion.div>
            ) : (
                searchResults.length > 0 && (
                    <motion.div className="mb-12 border-2 border-red-950 rounded-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <GlassCard className="p-6">
                            <motion.h2 className="text-2xl font-bold mb-6 text-white flex items-center" initial={{ x: -20 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
                                <FaSearch className="mr-2" /> Search Results
                            </motion.h2>
                            {/* Adjusted grid to span across two rows with a fixed height and overflow-x-auto */}
                            <div className="flex flex-wrap h-[600px] overflow-x-auto gap-6">
                                {searchResults.map(video => {
                                    return (
                                        <div key={video.videoId} className="flex-shrink-0 w-64">
                                            <VideoCard video={video} />
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    </motion.div>
                )
            )}
        </AnimatePresence>
    );
});
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const VideoSection = memo(({ title, message, icon, videos, isLoading }: { title: string; message: string; isLoading: boolean; videos: VideoType[]; icon: React.ReactNode }) => {
    return (
        <AnimatePresence>
            {isLoading ? (
                <motion.div className="flex justify-center items-center py-8 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <LoadingSpinner />
                </motion.div>
            ) : (
                videos.length > 0 && (
                    <motion.div className="mb-12 border-2 border-red-950 rounded-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <GlassCard className="p-6">
                            <motion.h2 className="text-2xl font-bold mb-2 text-white flex items-center" initial={{ x: -20 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
                                {icon} {title}
                            </motion.h2>
                            <motion.p className="text-orange-400 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                                {message}
                            </motion.p>
                            <div className="flex flex-wrap h-[600px] overflow-x-auto gap-6">
                                {videos.map(video => {
                                    return (
                                        <div key={video.videoId} className="flex-shrink-0 w-64">
                                            <VideoCard video={video} />
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    </motion.div>
                )
            )}
        </AnimatePresence>
    );
});
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
interface ContentSection {
    id: string;
    title: string;
    message: string;
    endpoint: string;
    icon: React.ReactNode;
}
export default function Home() {
    const [region, setRegion] = useState("India");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<VideoType[]>([]);
    const [sectionVideos, setSectionVideos] = useState<{ [key: string]: VideoType[] }>({});
    const [sectionsLoading, setSectionsLoading] = useState<{ [key: string]: boolean }>({});
    const contentSections: ContentSection[] = useMemo(
        () => [
            {
                id: "trending",
                title: "Trending",
                message: `Today's Trending In ${region}`,
                icon: <FaFire className="mr-2 text-red-500" />,
                endpoint: `/api/Trending?query=${encodeURIComponent(`Today's Trending In ${region}`)}`,
            },
            {
                id: "music",
                title: "Music Hits",
                message: `Latest Most Popular Music Videos In ${region}`,
                icon: <FaMusic className="mr-2 text-red-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Most Popular Music Videos In ${region}`)}`,
            },
            {
                id: "gaming",
                title: "Gaming",
                message: `Latest Top Gaming Content In ${region}`,
                icon: <FaGamepad className="mr-2 text-yellow-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Top Gaming Content In ${region}`)}`,
            },
            {
                id: "news",
                title: "Latest News",
                message: `Latest Breaking News In ${region}`,
                icon: <FaNewspaper className="mr-2 text-orange-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Breaking News In ${region}`)}`,
            },
            {
                id: "movies",
                title: "Movies",
                message: `Latest Top Movie Trailers And Clips In ${region}`,
                icon: <FaFilm className="mr-2 text-purple-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Top Movie Trailers And Clips In ${region}`)}`,
            },
            {
                id: "sports",
                title: "Sports",
                message: `Latest Sports Highlights In ${region}`,
                icon: <FaFutbol className="mr-2 text-green-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Sports Highlights In ${region}`)}`,
            },
            {
                id: "education",
                title: "Education",
                message: `Latest Educational Content In ${region}`,
                icon: <FaGraduationCap className="mr-2 text-blue-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Educational Content In ${region}`)}`,
            },
            {
                id: "technology",
                title: "Technology",
                message: `Latest Tech Videos In ${region}`,
                icon: <FaMicrochip className="mr-2 text-indigo-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Tech Videos In ${region}`)}`,
            },
        ],
        [region],
    );
    const handleSearch = useCallback(async (query: string) => {
        setIsSearchLoading(true);
        setSearchQuery(query);
        try {
            const response = await fetch(`/api/Search/Video/Multiple?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSearchResults(data.result);
        } catch (error) {
            console.error("Error searching videos:", error);
        } finally {
            setIsSearchLoading(false);
        }
    }, []);
    const fetchSectionVideos = useCallback(async (section: ContentSection) => {
        setSectionsLoading(prev => ({ ...prev, [section.id]: true }));
        try {
            const response = await fetch(section.endpoint);
            const data = await response.json();
            setSectionVideos(prev => ({ ...prev, [section.id]: data.result }));
        } catch (error) {
            console.error(`Error fetching videos for ${section.title}:`, error);
        } finally {
            setSectionsLoading(prev => ({ ...prev, [section.id]: false }));
        }
    }, []);
    useEffect(() => {
        contentSections.forEach((section, index) => {
            setTimeout(() => {
                fetchSectionVideos(section);
            }, index * 100);
        });
    }, [contentSections, fetchSectionVideos]);
    return (
        <div className="min-h-screen bg-stone-900">
            <Sidebar />
            <div className="md:ml-20 lg:ml-56">
                <div className="container mx-auto px-4 py-6">
                    <SearchBar onSearch={handleSearch} region={region} setRegion={setRegion} query={searchQuery} setQuery={setSearchQuery} />
                    <SearchResults searchResults={searchResults} isLoading={isSearchLoading} />
                    {contentSections.map(section => (
                        <VideoSection
                            key={section.id}
                            icon={section.icon}
                            title={section.title}
                            message={section.message}
                            isLoading={sectionsLoading[section.id]}
                            videos={sectionVideos[section.id] || []}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
