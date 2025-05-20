"use client";

import React, { useEffect, useMemo } from "react";
import { useZustandStore, valtioStore, VideoType } from "@/store/root";
import { useSnapshot } from "valtio";
import { FaFire, FaMusic, FaGamepad, FaNewspaper, FaFilm, FaFutbol, FaGraduationCap, FaMicrochip } from "react-icons/fa";

interface ContentSection {
    id: string;
    title: string;
    message: string;
    endpoint: string;
    icon: React.ReactNode;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const setZustandSectionVideos = useZustandStore(state => state.setSectionVideos);
    const setZustandSectionsLoading = useZustandStore(state => state.setSectionsLoading);

    const contentSections: ContentSection[] = useMemo(
        () => [
            {
                id: "trending",
                title: "Trending",
                message: `Today's Trending`,
                icon: <FaFire className="mr-2 text-red-500" />,
                endpoint: `/api/Trending`,
            },
            {
                id: "music",
                title: "Music Hits",
                message: `Latest Most Popular Music Videos`,
                icon: <FaMusic className="mr-2 text-red-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Most Popular Music Videos`)}`,
            },
            {
                id: "gaming",
                title: "Gaming",
                message: `Latest Top Gaming Content`,
                icon: <FaGamepad className="mr-2 text-yellow-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Top Gaming Content`)}`,
            },
            {
                id: "news",
                title: "Latest News",
                message: `Latest Breaking News`,
                icon: <FaNewspaper className="mr-2 text-orange-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Breaking News`)}`,
            },
            {
                id: "movies",
                title: "Movies",
                message: `Latest Top Movie Trailers And Clips`,
                icon: <FaFilm className="mr-2 text-purple-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Top Movie Trailers And Clips`)}`,
            },
            {
                id: "sports",
                title: "Sports",
                message: `Latest Sports Highlights`,
                icon: <FaFutbol className="mr-2 text-green-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Sports Highlights`)}`,
            },
            {
                id: "education",
                title: "Education",
                message: `Latest Educational Content`,
                icon: <FaGraduationCap className="mr-2 text-blue-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Educational Content`)}`,
            },
            {
                id: "technology",
                title: "Technology",
                message: `Latest Tech Videos`,
                icon: <FaMicrochip className="mr-2 text-indigo-500" />,
                endpoint: `/api/Search/Video/Multiple?query=${encodeURIComponent(`Latest Tech Videos`)}`,
            },
        ],
        [],
    );

    const fetchSectionVideos = async (section: ContentSection) => {
        setZustandSectionsLoading((prev: { [key: string]: boolean }) => ({ ...prev, [section.id]: true }));
        valtioStore.sectionsLoading[section.id] = true;
        try {
            const response = await fetch(section.endpoint);
            const data = await response.json();
            setZustandSectionVideos((prev: { [key: string]: VideoType[] }) => ({ ...prev, [section.id]: data.result }));
            valtioStore.sectionVideos[section.id] = data.result;
        } catch (error) {
            console.error(`Error fetching videos for ${section.title}:`, error);
        } finally {
            setZustandSectionsLoading((prev: { [key: string]: boolean }) => ({ ...prev, [section.id]: false }));
            valtioStore.sectionsLoading[section.id] = false;
        }
    };

    useEffect(() => {
        contentSections.forEach((section, index) => {
            setTimeout(() => {
                fetchSectionVideos(section);
            }, index * 100);
        });
    }, [contentSections]);

    return <>{children}</>;
}
