import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 1. Data Types
export interface LetterData {
    paperColor: string;
    envelopeColor: string;
    content: string;
    wordCount: number;
}

export interface ExtrasData {
    deliveryDate: string; // 'Bugün', '1Hafta', '1Ay', 'Ozel'
    scent: string;        // 'Yok', 'Gul', 'Lavanta', 'Okyanus'
    photos: string[];     // Array of URLs or IDs
    documents: string[];  // Array of URLs or IDs
    postcards: string[];  // Array of postcard IDs
    includeCalendar: boolean;
}

export interface AddressData {
    senderName: string;
    senderCity: string;
    senderAddress: string;

    receiverName: string;
    receiverCity: string;
    receiverAddress: string;
    receiverPhone: string;
}

// 2. State & Actions Interface
interface LetterStore {
    // States
    currentStep: number;
    letter: LetterData;
    extras: ExtrasData;
    address: AddressData;

    // Actions - Step Navigation
    setCurrentStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;

    // Actions - Updates
    updateLetter: (data: Partial<LetterData>) => void;
    updateExtras: (data: Partial<ExtrasData>) => void;
    updateAddress: (data: Partial<AddressData>) => void;

    // Actions - Reset
    resetStore: () => void;
}

const initialState = {
    currentStep: 1,
    letter: {
        paperColor: 'Beyaz',
        envelopeColor: 'Beyaz',
        content: '<p>Sevgili Gelecek, ...</p>',
        wordCount: 3,
    },
    extras: {
        deliveryDate: 'Bugün',
        scent: 'Yok',
        photos: [],
        documents: [],
        postcards: [],
        includeCalendar: false,
    },
    address: {
        senderName: '',
        senderCity: '',
        senderAddress: '',
        receiverName: '',
        receiverCity: '',
        receiverAddress: '',
        receiverPhone: '',
    }
};

// 3. Store Implementation
export const useLetterStore = create<LetterStore>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,

                setCurrentStep: (step) => set({ currentStep: step }),
                nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 6) })),
                prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

                updateLetter: (data) => set((state) => ({ letter: { ...state.letter, ...data } })),
                updateExtras: (data) => set((state) => ({ extras: { ...state.extras, ...data } })),
                updateAddress: (data) => set((state) => ({ address: { ...state.address, ...data } })),

                resetStore: () => set(initialState),
            }),
            {
                name: 'mektup-storage', // saves to localStorage so users don't lose their letter on refresh
            }
        )
    )
);
