"use client";
import { useAppStore } from "@/store";
import { motion } from "framer-motion";
import { regions } from "@/lib/region";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { FaSearch, FaFire, FaHistory, FaThumbsUp, FaRegBookmark, FaMusic, FaGamepad, FaNewspaper, FaFilm, FaFutbol, FaGraduationCap, FaMicrochip } from "react-icons/fa";
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const GlassCard = ({ children, className = "" }: { className?: string; children: React.ReactNode }) => (
    <div className={`bg-neutral-900/60 backdrop-blur-lg rounded-xl shadow-lg border border-neutral-900/50 ${className}`}>{children}</div>
);
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const SearchBar = () => {
    const { searchQuery, setSearchQuery, region, setRegion, setIsSearchLoading, setSearchResults } = useAppStore();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const handleSearch = useCallback(async () => {
        if (searchQuery.trim()) {
            setIsSearchLoading(true);
            try {
                const response = await fetch(`/api/Search/Video/Multiple?query=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();
                setSearchResults(data.result);
            } catch (error) {
                console.error("Error searching videos:", error);
            } finally {
                setIsSearchLoading(false);
            }
        }
    }, [searchQuery, setIsSearchLoading, setSearchResults]);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
    };
    return (
        <motion.div className="mb-8 sticky top-0 z-10 py-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <GlassCard className="p-2 rounded-3xl border-2 border-red-800">
                <div className="flex items-center">
                    <div className="relative flex-grow">
                        <motion.div className="absolute inset-0 rounded-l-md" animate={{ boxShadow: isSearchFocused ? "0 0 0 2px rgba(255, 0, 0, 0.5)" : "none" }} />
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
                        <motion.div className="w-10 h-10 bg-red-600 rounded-md flex items-center justify-center" whileHover={{ scale: 1.1 }}>
                            <span className="text-white text-xl font-bold">YT</span>
                        </motion.div>
                        <span className="hidden lg:block ml-2 text-xl font-bold text-white">VidStream</span>
                    </div>
                    <SidebarItem icon={<FaFire />} text="Trending" active /> <SidebarItem icon={<FaHistory />} text="History" /> <SidebarItem icon={<FaThumbsUp />} text="Liked" />
                    <SidebarItem icon={<FaRegBookmark />} text="Saved" />
                </div>
            </GlassCard>
        </motion.div>
    );
};
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
const SidebarItem = ({ icon, text, active = false }: { text: string; active?: boolean; icon: React.ReactNode }) => {
    return (
        <motion.div className={`flex items-center w-full p-2 rounded-lg cursor-pointer ${active ? "bg-red-600/40" : "hover:bg-neutral-900/50"}`} whileHover={{ scale: 1.05 }}>
            <div className="text-xl text-orange-300 flex justify-center lg:justify-start w-full lg:w-auto">{icon}</div> <span className="hidden lg:block ml-3 text-orange-300">{text}</span>
        </motion.div>
    );
};
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { region, sectionVideos, setSectionVideos, sectionsLoading, setSectionsLoading } = useAppStore();
    const fetchSectionVideos = useCallback(
        async (section: any) => {
            setSectionsLoading({ ...sectionsLoading, [section.id]: true });
            try {
                const response = await fetch(section.endpoint);
                const data = await response.json();
                setSectionVideos({ ...sectionVideos, [section.id]: data.result });
            } catch (error) {
                console.error(`Error fetching videos for ${section.title}:`, error);
            } finally {
                setSectionsLoading({ ...sectionsLoading, [section.id]: false });
            }
        },
        [region, sectionVideos, sectionsLoading, setSectionVideos, setSectionsLoading],
    );
    const contentSections = useMemo(
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
    useEffect(() => {
        contentSections.forEach(section => fetchSectionVideos(section));
    }, [contentSections, fetchSectionVideos]);
    return (
        <html lang="en">
            <body>
                <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-900">
                    <div className="fixed inset-0 bg-red-900/10 pointer-events-none" />
                    <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none" />
                    <Sidebar />
                    <div className="md:ml-20 lg:ml-56">
                        <div className="container mx-auto px-4 py-6">
                            <SearchBar />
                            {children}
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
