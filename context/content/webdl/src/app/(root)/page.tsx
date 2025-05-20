"use client";
import Image from "next/image";
import { regions } from "@/lib/region";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useCallback, useEffect, useMemo, memo, Fragment } from "react";
import { FaSearch, FaFire, FaHistory, FaThumbsUp, FaRegBookmark, FaMusic, FaGamepad, FaNewspaper, FaFilm, FaFutbol, FaGraduationCap, FaMicrochip } from "react-icons/fa";

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

const GlassCard = memo(({ children, className = "" }: { className?: string; children: React.ReactNode }) => (
    <div className={`bg-neutral-900/60 backdrop-blur-lg rounded-xl shadow-lg border border-neutral-900/50 ${className}`}>{children}</div>
));

const LoadingSpinner = memo(() => (
    <motion.div className="h-16 w-16 rounded-full border-t-4 border-red-500 border-opacity50" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
));

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
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleSearch = () => {
        if (query.trim()) onSearch(query);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <motion.div className="mb-8 sticky top-0 z-50 py-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <GlassCard className="p-2 rounded-3xl border-2 border-red-800">
                <div className="flex items-center">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-l-md bg-neutral-900/70 text-white border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Search videos..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
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

const SidebarItem = memo(({ icon, text, active = false }: { text: string; active?: boolean; icon: React.ReactNode }) => {
    return (
        <motion.div className={`flex items-center w-full p-2 rounded-lg cursor-pointer ${active ? "bg-red-600/40" : "hover:bg-neutral-900/50"}`} whileHover={{ scale: 1.05 }}>
            <div className="text-xl text-orange-300 flex justify-center lg:justify-start w-full lg:w-auto">{icon}</div> <span className="hidden lg:block ml-3 text-orange-300">{text}</span>
        </motion.div>
    );
});

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

export default function Home() {
    return (
        <main className="relative min-h-screen bg-black text-white">
            <div className="absolute right-[-200px] top-[-200px] w-[500px] h-[500px] bg-red-600 opacity-20 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="relative z-10">
                <Sidebar />
                <div className="ml-0 md:ml-20 lg:ml-56 p-4">
                    <SearchBar onSearch={() => {}} region="India" setRegion={() => {}} query="" setQuery={() => {}} />
                </div>
            </div>
        </main>
    );
}
