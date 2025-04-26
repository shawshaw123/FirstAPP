import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActiveRental, RentalHistory } from "@/components";
import {
  startRental as startRentalService,
  endRental as endRentalService,
  getRentalHistory,
  getActiveRental
} from "@/Firebase/station-service";
import { useAuthStore } from "./auth-store";

interface RentalState {
  activeRental: ActiveRental | null;
  history: RentalHistory[];
  isLoading: boolean;
  error: string | null;
  startRental: (bikeId: string, bikeName: string, stationId: string, stationName: string) => Promise<void>;
  endRental: (endStationId: string) => Promise<RentalHistory | null>;
  loadActiveRental: () => Promise<void>;
  loadRentalHistory: () => Promise<void>;
  getCurrentCost: () => number;
  getRentalDuration: () => string;
  clearError: () => void;
}

export const useRentalStore = create<RentalState>()(
    persist(
        (set, get) => ({
          activeRental: null,
          history: [],
          isLoading: false,
          error: null,

          startRental: async (bikeId: string, bikeName: string, stationId: string, stationName: string) => {
            const user = useAuthStore.getState().user;
            if (!user) {
              set({ error: "User not authenticated" });
              return;
            }

            set({ isLoading: true, error: null });

            try {
              const rental = await startRentalService(
                  user.id,
                  bikeId,
                  bikeName,
                  stationId,
                  stationName
              );

              set({
                activeRental: rental,
                isLoading: false,
              });
            } catch (error) {
              set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to start rental"
              });
            }
          },

          endRental: async (endStationId: string) => {
            const user = useAuthStore.getState().user;
            const activeRental = get().activeRental;

            if (!user || !activeRental) {
              set({ error: "No active rental or user not authenticated" });
              return null;
            }

            set({ isLoading: true, error: null });

            try {
              const rentalHistory = await endRentalService(
                  user.id,
                  activeRental.id!,
                  endStationId
              );

              set(state => ({
                activeRental: null,
                history: [rentalHistory, ...state.history],
                isLoading: false,
              }));

              return rentalHistory;
            } catch (error) {
              set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to end rental"
              });
              return null;
            }
          },

          loadActiveRental: async () => {
            const user = useAuthStore.getState().user;
            if (!user) return;

            set({ isLoading: true, error: null });

            try {
              const rental = await getActiveRental(user.id);
              set({
                activeRental: rental,
                isLoading: false,
              });
            } catch (error) {
              set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to load active rental"
              });
            }
          },

          loadRentalHistory: async () => {
            const user = useAuthStore.getState().user;
            if (!user) return;

            set({ isLoading: true, error: null });

            try {
              const history = await getRentalHistory(user.id);
              set({
                history,
                isLoading: false,
              });
            } catch (error) {
              set({
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to load rental history"
              });
            }
          },

          getCurrentCost: () => {
            const activeRental = get().activeRental;
            if (!activeRental) return 0;

            const startDate = new Date(activeRental.startTime);
            const now = new Date();

            // Calculate duration in minutes
            const durationMs = now.getTime() - startDate.getTime();
            const durationMinutes = Math.floor(durationMs / (1000 * 60));

            // Calculate cost based on duration (minimum 20, then 20 per hour)
            return Math.max(20, Math.ceil(durationMinutes / 60) * 20);
          },

          getRentalDuration: () => {
            const activeRental = get().activeRental;
            if (!activeRental) return "00:00:00";

            const startDate = new Date(activeRental.startTime);
            const now = new Date();

            // Calculate duration in seconds
            const durationMs = now.getTime() - startDate.getTime();
            const durationSeconds = Math.floor(durationMs / 1000);

            const hours = Math.floor(durationSeconds / 3600);
            const minutes = Math.floor((durationSeconds % 3600) / 60);
            const seconds = durationSeconds % 60;

            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
          },

          clearError: () => {
            set({ error: null });
          },
        }),
        {
          name: "rental-storage",
          storage: createJSONStorage(() => AsyncStorage),
        }
    )
);