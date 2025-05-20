import { create } from "zustand";
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
}

interface ContentSection {
    id: string;
    title: string;
    message: string;
    endpoint: string;
}

interface VideoState {
    region: string;
    searchQuery: string;
    isSearchLoading: boolean;
    searchResults: VideoType[];
    sectionVideos: { [key: string]: VideoType[] };
    sectionsLoading: { [key: string]: boolean };
    contentSections: ContentSection[];
    setRegion: (region: string) => void;
    setSearchQuery: (query: string) => void;
    fetchSearchResults: (query: string) => Promise<void>;
    fetchSectionVideos: (section: ContentSection) => Promise<void>;
    initializeSections: () => void;
}

export const useVideoStore = create<VideoState>((set, get) => ({
    region: "India",
    searchQuery: "",
    isSearchLoading: false,
    searchResults: [],
    sectionVideos: {},
    sectionsLoading: {},
    contentSections: [
        {
            id: "trending",
            title: "Trending",
            message: "Today's Trending", // Message will be appended with region in component
            endpoint: "/api/Trending",
        },
        {
            id: "music",
            title: "Music Hits",
            message: "Latest Most Popular Music Videos",
            endpoint: "/api/Search/Video/Multiple",
        },
        {
            id: "gaming",
            title: "Gaming",
            message: "Latest Top Gaming Content",
            endpoint: "/api/Search/Video/Multiple",
        },
        {
            id: "news",
            title: "Latest News",
            message: "Latest Breaking News",
            endpoint: "/api/Search/Video/Multiple",
        },
        {
            id: "movies",
            title: "Movies",
            message: "Latest Top Movie Trailers And Clips",
            endpoint: "/api/Search/Video/Multiple",
        },
        {
            id: "sports",
            title: "Sports",
            message: "Latest Sports Highlights",
            endpoint: "/api/Search/Video/Multiple",
        },
        {
            id: "education",
            title: "Education",
            message: "Latest Educational Content",
            endpoint: "/api/Search/Video/Multiple",
        },
        {
            id: "technology",
            title: "Technology",
            message: "Latest Tech Videos",
            endpoint: "/api/Search/Video/Multiple",
        },
    ],

    setRegion: (region: string) => {
        set({ region });
        // When region changes, re-fetch all section videos
        get().initializeSections();
    },
    setSearchQuery: (query: string) => set({ searchQuery: query }),

    fetchSearchResults: async (query: string) => {
        set({ isSearchLoading: true, searchResults: [] });
        try {
            const response = await fetch(`/api/Search/Video/Multiple?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            set({ searchResults: data.result });
        } catch (error) {
            console.error("Error searching videos:", error);
            set({ searchResults: [] });
        } finally {
            set({ isSearchLoading: false });
        }
    },

    fetchSectionVideos: async (section: ContentSection) => {
        set(state => ({
            sectionsLoading: { ...state.sectionsLoading, [section.id]: true },
        }));
        try {
            const currentRegion = get().region;
            const query = `${section.message} In ${currentRegion}`;
            const response = await fetch(`${section.endpoint}?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            set(state => ({
                sectionVideos: { ...state.sectionVideos, [section.id]: data.result },
            }));
        } catch (error) {
            console.error(`Error fetching videos for ${section.title}:`, error);
            set(state => ({
                sectionVideos: { ...state.sectionVideos, [section.id]: [] },
            }));
        } finally {
            set(state => ({
                sectionsLoading: { ...state.sectionsLoading, [section.id]: false },
            }));
        }
    },

    initializeSections: () => {
        const { contentSections, fetchSectionVideos } = get();
        contentSections.forEach((section, index) => {
            setTimeout(() => {
                fetchSectionVideos(section);
            }, index * 100); // Small delay to avoid hammering the API
        });
    },
}));
