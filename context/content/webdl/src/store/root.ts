import { create } from "zustand";

export interface VideoType {
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

// Zustand Store
interface ZustandStore {
    zustandData: string;
    setZustandData: (data: string) => void;
    sectionVideos: { [key: string]: VideoType[] };
    setSectionVideos: (videos: { [key: string]: VideoType[] }) => void;
    sectionsLoading: { [key: string]: boolean };
    setSectionsLoading: (loading: { [key: string]: boolean }) => void;
}

export const useZustandStore = create<ZustandStore>(set => ({
    zustandData: "",
    setZustandData: data => set({ zustandData: data }),
    sectionVideos: {},
    setSectionVideos: videos => set({ sectionVideos: videos }),
    sectionsLoading: {},
    setSectionsLoading: loading => set({ sectionsLoading: loading }),
}));
