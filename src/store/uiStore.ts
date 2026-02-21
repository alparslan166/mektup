import { create } from 'zustand';

interface UIState {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
}));
