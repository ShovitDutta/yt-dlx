"use client";
import Image from "next/image";
import { regions } from "@/lib/region";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaFire, FaHistory, FaThumbsUp, FaRegBookmark, FaMusic, FaGamepad, FaNewspaper } from "react-icons/fa";
import { useState, useCallback, useEffect, useRef } from "react";

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

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
}
const GlassCard = ({ children, className = "" }: GlassCardProps) => <div className={`bg-neutral-900/60 backdrop-blur-lg rounded-xl shadow-lg border border-neutral-900/50 ${className}`}>{children}</div>;

interface SearchBarProps {
    onSearch: (query: string) => void;
    region: string;
    setRegion: (region: string) => void;
}
const SearchBar = ({ onSearch, region, setRegion }: SearchBarProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleSearch = () => {
        if (searchQuery.trim()) onSearch(searchQuery);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <motion.div className="mb-8 sticky top-0 z-10 py-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <GlassCard className="p-2">
                <div className="flex items-center">
                    <div className="relative flex-grow">
                        <motion.div
                            className="absolute inset-0 rounded-l-md"
                            animate={{
                                boxShadow: isSearchFocused ? "0 0 0 2px rgba(255, 0, 0, 0.5)" : "none",
                            }}
                        />
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-l-md bg-neutral-900/70 text-white border-0 focus:outline-none"
                            placeholder="Search videos..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <motion.button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-5 rounded-r-md" onClick={handleSearch} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <FaSearch />
                    </motion.button>
                    <motion.div className="ml-4" whileHover={{ scale: 1.05 }}>
                        <select
                            className="px-4 py-3 rounded-md bg-neutral-900/70 text-white border border-neutral-900/50 focus:outline-none focus:ring-2 focus:ring-red-500"
                            value={region}
                            onChange={e => setRegion(e.target.value)}>
                            {regions.map(region => (
                                <option key={region.code} value={region.name}>
                                    {region.name}
                                </option>
                            ))}
                        </select>
                    </motion.div>
                </div>
            </GlassCard>
        </motion.div>
    );
};

const Sidebar = () => {
    return (
        <motion.div className="hidden md:block w-20 lg:w-56 fixed left-0 top-0 h-full" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <GlassCard className="h-full py-8 px-2 lg:px-4">
                <div className="flex flex-col items-center lg:items-start gap-8">
                    <div className="flex items-center justify-center lg:justify-start w-full mb-6">
                        <motion.div className="w-10 h-10 bg-red-600 rounded-md flex items-center justify-center" whileHover={{ scale: 1.1 }}>
                            <span className="text-white text-xl font-bold">YT</span>
                        </motion.div>
                        <span className="hidden lg:block ml-2 text-xl font-bold text-white">VidStream</span>
                    </div>

                    <SidebarItem icon={<FaFire />} text="Trending" active />
                    <SidebarItem icon={<FaHistory />} text="History" />
                    <SidebarItem icon={<FaThumbsUp />} text="Liked" />
                    <SidebarItem icon={<FaRegBookmark />} text="Saved" />
                </div>
            </GlassCard>
        </motion.div>
    );
};

interface SidebarItemProps {
    icon: React.ReactNode;
    text: string;
    active?: boolean;
}
const SidebarItem = ({ icon, text, active = false }: SidebarItemProps) => {
    return (
        <motion.div
            className={`flex items-center w-full p-2 rounded-lg cursor-pointer
        ${active ? "bg-red-600/40" : "hover:bg-neutral-900/50"}`}
            whileHover={{ scale: 1.05 }}>
            <div className="text-xl text-orange-300 flex justify-center lg:justify-start w-full lg:w-auto">{icon}</div>
            <span className="hidden lg:block ml-3 text-orange-300">{text}</span>
        </motion.div>
    );
};

interface VideoCardProps {
    video: VideoType;
}
const VideoCard = ({ video }: VideoCardProps) => {
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
            <GlassCard className="overflow-hidden relative h-full">
                <div className="relative">
                    {video.thumbnails && video.thumbnails.length > 0 ? (
                        <>
                            <Image src={video.thumbnails[0].url} alt={video.title} width={380} height={220} className="w-full rounded-t-xl object-cover" />
                            <motion.div className="absolute inset-0 bg-red-600/20" initial={{ opacity: 0 }} animate={{ opacity: isHovered ? 1 : 0 }} transition={{ duration: 0.3 }} />
                        </>
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
                            <h3 className="text-lg font-semibold text-white line-clamp-2">{video.title}</h3>
                            <p className="text-orange-400 mt-1">{video.authorName}</p>
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
};

interface SearchResultsProps {
    searchResults: VideoType[];
    isLoading: boolean;
    lastVideoElementRef: React.Ref<HTMLDivElement>;
}
const SearchResults = ({ searchResults, isLoading, lastVideoElementRef }: SearchResultsProps) => {
    return (
        <AnimatePresence>
            {isLoading && searchResults.length === 0 ? (
                <motion.div className="flex justify-center items-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <LoadingSpinner />
                </motion.div>
            ) : (
                searchResults.length > 0 && (
                    <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <GlassCard className="p-6">
                            <motion.h2 className="text-2xl font-bold mb-6 text-white flex items-center" initial={{ x: -20 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
                                <FaSearch className="mr-2" /> Search Results
                            </motion.h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {searchResults.map((video, index) => {
                                    if (searchResults.length === index + 1) {
                                        return (
                                            <div ref={lastVideoElementRef} key={video.videoId}>
                                                <VideoCard video={video} />
                                            </div>
                                        );
                                    } else {
                                        return <VideoCard key={video.videoId} video={video} />;
                                    }
                                })}
                            </div>
                        </GlassCard>
                    </motion.div>
                )
            )}
        </AnimatePresence>
    );
};

interface VideoSectionProps {
    title: string;
    message: string;
    icon: React.ReactNode;
    videos: VideoType[];
    isLoading: boolean;
}
const VideoSection = ({ title, message, icon, videos, isLoading }: VideoSectionProps) => {
    return (
        <AnimatePresence>
            {isLoading ? (
                <motion.div className="flex justify-center items-center py-8 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <LoadingSpinner />
                </motion.div>
            ) : (
                videos.length > 0 && (
                    <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <GlassCard className="p-6">
                            <motion.h2 className="text-2xl font-bold mb-2 text-white flex items-center" initial={{ x: -20 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
                                {icon} {title}
                            </motion.h2>

                            <motion.p className="text-orange-400 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                                {message}
                            </motion.p>

                            <div className="flex flex-wrap h-80 overflow-x-auto gap-6">
                                {videos.map((video, index) => (
                                    <div key={video.videoId} className="flex-shrink-0 w-64">
                                        <VideoCard video={video} />
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                )
            )}
        </AnimatePresence>
    );
};

const LoadingSpinner = () => (
    <motion.div className="h-16 w-16 rounded-full border-t-4 border-red-500 border-opacity50" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
);

interface ContentSection {
    id: string;
    title: string;
    message: string;
    endpoint: string;
    icon: React.ReactNode;
}

export default function Home() {
    const [region, setRegion] = useState("India");
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [sectionsLoading, setSectionsLoading] = useState<{ [key: string]: boolean }>({});
    const [searchResults, setSearchResults] = useState<VideoType[]>([]);
    const [sectionVideos, setSectionVideos] = useState<{ [key: string]: VideoType[] }>({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const contentSections: ContentSection[] = [
        {
            id: "trending",
            title: "Trending",
            message: `Today's Trending in ${region}`,
            endpoint: `/api/Trending?region=${encodeURIComponent(region)}`,
            icon: <FaFire className="mr-2 text-red-500" />,
        },
        {
            id: "music",
            title: "Music Hits",
            message: `Most popular music videos in ${region}`,
            endpoint: `/api/Search/Video/Multiple?query=music&region=${encodeURIComponent(region)}`,
            icon: <FaMusic className="mr-2 text-red-500" />,
        },
        {
            id: "gaming",
            title: "Gaming",
            message: `Top gaming content in ${region}`,
            endpoint: `/api/Search/Video/Multiple?query=gaming&region=${encodeURIComponent(region)}`,
            icon: <FaGamepad className="mr-2 text-yellow-500" />,
        },
        {
            id: "news",
            title: "Latest News",
            message: `Breaking news in ${region}`,
            endpoint: `/api/Search/Video/Multiple?query=news&region=${encodeURIComponent(region)}`,
            icon: <FaNewspaper className="mr-2 text-orange-500" />,
        },
    ];

    const observer = useRef<IntersectionObserver | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const lastVideoElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (isSearchLoading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMoreVideos();
                }
            });
            if (node) observer.current.observe(node);
        },
        [isSearchLoading, hasMore],
    );

    const loadMoreVideos = useCallback(() => {
        setPage(prevPage => prevPage + 1);
    }, []);

    const handleSearch = useCallback(async (query: string) => {
        setIsSearchLoading(true);
        setPage(1);
        setSearchQuery(query);
        try {
            const response = await fetch(`/api/Search/Video/Multiple?query=${encodeURIComponent(query)}&page=1`);
            const data = await response.json();
            setSearchResults(data.result);
            setHasMore(data.result.length > 0);
        } catch (error) {
            console.error("Error searching videos:", error);
        } finally {
            setIsSearchLoading(false);
        }
    }, []);

    useEffect(() => {
        if (page > 1) {
            const fetchMoreSearchResults = async () => {
                setIsSearchLoading(true);
                try {
                    const response = await fetch(`/api/Search/Video/Multiple?query=${encodeURIComponent(searchQuery)}&page=${page}`);
                    const data = await response.json();
                    setSearchResults(prev => [...prev, ...data.result]);
                    setHasMore(data.result.length > 0);
                } catch (error) {
                    console.error("Error loading more videos:", error);
                } finally {
                    setIsSearchLoading(false);
                }
            };

            fetchMoreSearchResults();
        }
    }, [page]);

    const fetchSectionVideos = useCallback(
        async (section: ContentSection) => {
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
        },
        [region],
    );

    useEffect(() => {
        contentSections.forEach(section => {
            fetchSectionVideos(section);
        });
    }, [fetchSectionVideos]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-900">
            <div className="fixed inset-0 bg-red-900/10 pointer-events-none" />
            <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none" />

            <Sidebar />

            <div className="md:ml-20 lg:ml-56">
                <div className="container mx-auto px-4 py-6">
                    <SearchBar onSearch={handleSearch} region={region} setRegion={setRegion} />

                    {/* Search Results Section */}
                    <SearchResults searchResults={searchResults} isLoading={isSearchLoading} lastVideoElementRef={lastVideoElementRef} />

                    {/* Content Sections */}
                    {contentSections.map(section => (
                        <VideoSection
                            key={section.id}
                            title={section.title}
                            message={section.message}
                            icon={section.icon}
                            videos={sectionVideos[section.id] || []}
                            isLoading={sectionsLoading[section.id]}
                        />
                    ))}

                    {/* Loading indicator for infinite scroll */}
                    {isSearchLoading && page > 1 && (
                        <div className="flex justify-center my-6">
                            <LoadingSpinner />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
