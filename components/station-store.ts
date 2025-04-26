import { create } from "zustand";
import { BikeStation, Bike } from "@/components";
import {
  getStations as getStationsService,
  getStationById as getStationByIdService,
  getBikesByStation as getBikesByStationService
} from "@/components/station-service";

interface StationState {
  stations: BikeStation[];
  selectedStation: BikeStation | null;
  stationBikes: Bike[];
  isLoading: boolean;
  error: string | null;
  loadStations: () => Promise<void>;
  loadStationById: (stationId: string) => Promise<void>;
  loadBikesByStation: (stationId: string) => Promise<void>;
  searchStations: (query: string) => BikeStation[];
  clearError: () => void;
}

export const useStationStore = create<StationState>((set, get) => ({
  stations: [],
  selectedStation: null,
  stationBikes: [],
  isLoading: false,
  error: null,

  loadStations: async () => {
    set({ isLoading: true, error: null });

    try {
      const stations = await getStationsService();
      set({
        stations,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load stations"
      });
    }
  },

  loadStationById: async (stationId: string) => {
    set({ isLoading: true, error: null });

    try {
      const station = await getStationByIdService(stationId);
      set({
        selectedStation: station,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load station"
      });
    }
  },

  loadBikesByStation: async (stationId: string) => {
    set({ isLoading: true, error: null });

    try {
      const bikes = await getBikesByStationService(stationId);
      set({
        stationBikes: bikes,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load bikes"
      });
    }
  },

  searchStations: (query: string) => {
    const stations = get().stations;

    if (!query.trim()) {
      return stations;
    }

    return stations.filter(station =>
        station.name.toLowerCase().includes(query.toLowerCase())
    );
  },

  clearError: () => {
    set({ error: null });
  },
}));