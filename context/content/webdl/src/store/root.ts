import { create } from "zustand";
import { proxy } from "valtio";

// Zustand Store
interface ZustandStore {
  zustandData: string;
  setZustandData: (data: string) => void;
}

export const useZustandStore = create<ZustandStore>((set) => ({
  zustandData: "",
  setZustandData: (data) => set({ zustandData: data }),
}));

// Valtio Store
interface ValtioStore {
  valtioData: string;
}

export const valtioStore = proxy<ValtioStore>({
  valtioData: "",
});
