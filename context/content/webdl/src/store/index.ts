import { create } from "zustand";
interface AppState {
    region: string;
    searchQuery: string;
    searchResults: any[];
    isSearchLoading: boolean;
    setRegion: (region: string) => void;
    sectionVideos: { [key: string]: any[] };
    setSearchQuery: (query: string) => void;
    setSearchResults: (results: any[]) => void;
    sectionsLoading: { [key: string]: boolean };
    setIsSearchLoading: (isLoading: boolean) => void;
    setSectionVideos: (videos: { [key: string]: any[] }) => void;
    setSectionsLoading: (loading: { [key: string]: boolean }) => void;
}
export const useAppStore = create<AppState>(set => ({
    region: "India",
    searchQuery: "",
    searchResults: [],
    isSearchLoading: false,
    sectionVideos: {},
    sectionsLoading: {},
    setRegion: region => set({ region }),
    setSearchQuery: query => set({ searchQuery: query }),
    setSectionVideos: videos => set({ sectionVideos: videos }),
    setSearchResults: results => set({ searchResults: results }),
    setSectionsLoading: loading => set({ sectionsLoading: loading }),
    setIsSearchLoading: isLoading => set({ isSearchLoading: isLoading }),
}));
