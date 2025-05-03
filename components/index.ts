export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  walletBalance: number;
}

export interface BikeStation {
  id: string;
  name: string;
  availableBikes: number;
  emptySlots: number;
  location: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
  isActive?: boolean; // Add status flag for Android UI state management
}

export interface Bike {
  id: string;
  name: string;
  stationId: string;
  available: boolean;
  pricePerHour: number;
  isElectric: boolean; // Changed from 'any' to 'boolean' for type safety
  batteryLevel: number;
  lastMaintenance?: string; // Optional maintenance date for UI display
}

export interface RentalHistory {
  id: string;
  bikeId: string;
  bikeName: string;
  startTime: string;
  endTime: string;
  startStation: string;
  endStation: string;
  duration: string;
  cost: number;
  distance: number;
  completed?: boolean; // Flag for UI state management
}

export interface ActiveRental {
  id?: string;
  bikeId: string;
  bikeName: string;
  startTime: string;
  startStation: string;
  stationId: string;
  currentCost: number;
  isBackgroundTracking?: boolean; // Flag for Android background service status
}

// New interface for responsive UI dimensions
export interface UIConstants {
  padding: {
    small: number;
    medium: number;
    large: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  elevation: {
    small: number;
    medium: number;
    large: number;
  };
}