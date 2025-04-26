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
}

export interface Bike {
  id: string;
  name: string;
  stationId: string;
  available: boolean;
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
}

export interface ActiveRental {
  id?: string;
  bikeId: string;
  bikeName: string;
  startTime: string;
  startStation: string;
  stationId: string;
  currentCost: number;
}