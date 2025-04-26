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
  latitude: number;
  longitude: number;
  availableBikes: number;
  emptySlots: number;
  distance: number; // in kilometers
  isActive: boolean;
}

export interface Bike {
  id: string;
  name: string;
  stationId: string;
  isAvailable: boolean;
  isElectric: boolean;
  batteryLevel: number;
  pricePerHour: number;
}

export interface Rental {
  id: string;
  userId: string;
  bikeId: string;
  startStationId: string;
  endStationId: string | null;
  startTime: string;
  endTime: string | null;
  cost: number | null;
  status: 'active' | 'completed' | 'cancelled';
}

export interface RentalWithDetails extends Rental {
  bike: Bike;
  startStation: BikeStation;
  endStation: BikeStation | null;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  data?: any;
}

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'gcash' | 'paymaya' | 'credit_card';
  name: string;
  isDefault: boolean;
  lastFour?: string;
  expiryDate?: string;
}