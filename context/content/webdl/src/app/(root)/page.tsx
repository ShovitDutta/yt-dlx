"use client";
import Image from "next/image";
import { useAppStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useMemo, memo, Fragment } from "react";
import { FaSearch, FaFire, FaThumbsUp, FaRegBookmark, FaMusic, FaGamepad, FaNewspaper, FaFilm, FaFutbol, FaGraduationCap, FaMicrochip } from "react-icons/fa";
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
    <div className={`bg-neutral-900/60 backdrop-blur-lg rounded-xl shadow-lg border border-neutral-900/50 ${className}`}>{children}</div>
));
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const LoadingSpinner = memo(() => (
    <motion.div className="h-16 w-16 rounded-full border-t-4 border-red-500 border-opacity50" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
));
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
                    <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <GlassCard className="p-6">
                            <motion.h2 className="text-2xl font-bold mb-6 text-white flex items-center" initial={{ x: -20 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
                                <FaSearch className="mr-2" /> Search Results
                            </motion.h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {searchResults.map(video => {
                                    return <VideoCard key={video.videoId} video={video} />;
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
    const { region, searchResults, isSearchLoading, sectionVideos, sectionsLoading } = useAppStore();

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

    // Removed handleSearch and fetchSectionVideos as they are now in layout.tsx

    // Removed useEffect as it is now in layout.tsx

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-900">
            <div className="fixed inset-0 bg-red-900/10 pointer-events-none" />
            <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none" />
            {/* Sidebar and SearchBar are now in layout.tsx */}
            <div className="md:ml-20 lg:ml-56">
                <div className="container mx-auto px-4 py-6">
                    {/* SearchBar is now in layout.tsx */}
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
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
