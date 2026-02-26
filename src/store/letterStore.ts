import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 1. Data Types
export interface LetterData {
    paperColor: string;
    envelopeColor: string;
    content: string;
    wordCount: number;
}

export interface UploadedFile {
    id: string;
    name: string;
    url: string;
    previewUrl?: string; // Short-lived presigned URL for immediate preview
    type: "photo" | "doc";
}

export interface SelectedGift {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
}

export interface ExtrasData {
    deliveryDate: string; // 'Bugün', '1Hafta', '1Ay', 'Ozel'
    scent: string;        // 'Yok', 'Gul', 'Lavanta', 'Okyanus'
    photos: UploadedFile[];
    documents: UploadedFile[];
    postcards: string[];  // Array of postcard IDs
    includeCalendar: boolean;
    gifts: SelectedGift[];
    customDate?: string;
}

export interface AddressData {
    senderName: string;
    senderCity: string;
    senderAddress: string;

    receiverName: string;
    receiverCity: string;
    receiverAddress: string;
    receiverPhone: string;
    receiverId?: string; // For DM/Inbox letters

    // Prison specific
    isPrison: boolean;
    prisonName?: string;
    fatherName?: string;
    wardNumber?: string;
    prisonNote?: string;
}

// 2. State & Actions Interface
interface LetterStore {
    // States
    draftId: string | null;
    currentStep: number;
    letter: LetterData;
    extras: ExtrasData;
    address: AddressData;

    // Actions - Step Navigation
    setCurrentStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;

    // Actions - Updates
    setDraftId: (id: string | null) => void;
    updateLetter: (data: Partial<LetterData>) => void;
    updateExtras: (data: Partial<ExtrasData>) => void;
    updateAddress: (data: Partial<AddressData>) => void;

    // Actions - Reset
    resetStore: () => void;

    // Actions - Database Sync
    hydrateStore: (data: any) => void;
}

const initialState = {
    draftId: null,
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
        gifts: [],
        customDate: "",
    },
    address: {
        senderName: '',
        senderCity: '',
        senderAddress: '',
        receiverName: '',
        receiverCity: '',
        receiverAddress: '',
        receiverPhone: '',
        isPrison: false,
        prisonName: '',
        fatherName: '',
        wardNumber: '',
        prisonNote: '',
    }
}

// 3. Store Implementation
export const useLetterStore = create<LetterStore>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,

                setCurrentStep: (step) => set({ currentStep: step }),
                nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 6) })),
                prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

                setDraftId: (id) => set({ draftId: id }),
                updateLetter: (data) => set((state) => ({ letter: { ...state.letter, ...data } })),
                updateExtras: (data) => set((state) => ({ extras: { ...state.extras, ...data } })),
                updateAddress: (data) => set((state) => ({ address: { ...state.address, ...data } })),

                resetStore: () => set(initialState),

                hydrateStore: (data) => set((state) => ({
                    draftId: data.draftId || state.draftId,
                    letter: data.letter || state.letter,
                    extras: data.extras || state.extras,
                    address: data.address || state.address,
                })),
            }),
            {
                name: 'mektup-storage', // saves to localStorage so users don't lose their letter on refresh
            }
        )
    )
);
