import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TripItem {
  id: string;
  type: 'flight' | 'hotel' | 'food' | 'activity';
  time: string;
  title: string;
  description: string;
  price: number;
  data: any; // Raw data from DB
  imageUrl?: string;
}

export interface Itinerary {
  id: string;
  destination: string;
  days: number;
  budget: number;
  items: TripItem[];
  totalPrice: number;
  sentimentSummary?: string;
}

export interface UserProfile {
  budgetLevel: string;
  foodRestrictions: string[];
  preferredHotelStyle: string;
}

interface TripState {
  currentTrip: Itinerary | null;
  userPreferences: UserProfile | null;
  setTrip: (trip: Itinerary | null) => void;
  setUserPreferences: (prefs: UserProfile) => void;
  swapActivity: (oldId: string, newItem: TripItem) => void;
  lang: 'th' | 'en';
  setLang: (lang: 'th' | 'en') => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      currentTrip: null,
      userPreferences: null,
      lang: 'th',
      setLang: (lang) => set({ lang }),
      setTrip: (trip) => set({ currentTrip: trip }),
      setUserPreferences: (prefs) => set({ userPreferences: prefs }),
      swapActivity: (oldId, newItem) => set((state) => {
        if (!state.currentTrip) return state;
        
        // Find old item to subtract its price
        const oldItem = state.currentTrip.items.find(i => i.id === oldId);
        if (!oldItem) return state;

        // Replace item in the array
        const newItems = state.currentTrip.items.map(item => 
          item.id === oldId ? { ...newItem, time: item.time } : item // Keep original time
        );

        // Recalculate total price
        const newTotal = state.currentTrip.totalPrice - oldItem.price + newItem.price;

        return {
          currentTrip: {
            ...state.currentTrip,
            items: newItems,
            totalPrice: newTotal
          }
        };
      })
    }),
    {
      name: 'trip-store', // key for localStorage
    }
  )
);
