import { proxy } from "valtio";
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
    authorThumbnails: any[];
}
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
interface ValtioStore {
    valtioData: string;
    sectionVideos: { [key: string]: any[] };
    sectionsLoading: { [key: string]: boolean };
}
export const valtioStore = proxy<ValtioStore>({ valtioData: "", sectionVideos: {}, sectionsLoading: {} });
