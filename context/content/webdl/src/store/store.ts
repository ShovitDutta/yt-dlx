import { create } from "zustand";
interface MainStore {
    data: any;
    setData: (data: any) => void;
}
export const mainStore = create<MainStore>(set => ({ data: null, setData: data => set({ data }) }));
