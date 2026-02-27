import { create } from 'zustand';

interface UIState {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    creditBalance: number;
    setCreditBalance: (balance: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
    creditBalance: 0,
    setCreditBalance: (balance) => set({ creditBalance: balance }),
}));
