import { create } from "zustand";
import { proxy } from "valtio";

// Zustand Store
interface ZustandStore {
    zustandData: string;
    setZustandData: (data: string) => void;
}

export const useZustandStore = create<ZustandStore>(set => ({
    zustandData: "",
    setZustandData: data => set({ zustandData: data }),

    sectionVideos: {},
    setSectionVideos: videos => set({ sectionVideos: videos }),
    sectionsLoading: {},
    setSectionsLoading: loading => set({ sectionsLoading: loading }),
}));

// Valtio Store
interface ValtioStore {
    valtioData: string;
    sectionVideos: { [key: string]: any[] };
    sectionsLoading: { [key: string]: boolean };
}

export const valtioStore = proxy<ValtioStore>({
    valtioData: "",
    sectionVideos: {},
    sectionsLoading: {},
});
