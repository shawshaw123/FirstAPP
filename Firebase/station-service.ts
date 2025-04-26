import AsyncStorage from '@react-native-async-storage/async-storage';
import { BikeStation, Bike, RentalHistory, ActiveRental } from '@/components';
import { stations as mockStations, bikes as mockBikes, rentalHistory as mockRentalHistory } from '@/components/stations';

// Storage keys
const ACTIVE_RENTAL_KEY = 'active_rental';
const RENTAL_HISTORY_KEY = 'rental_history';

// Get all bike stations
export const getStations = async (): Promise<BikeStation[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return [...mockStations];
};

// Get station by ID
export const getStationById = async (stationId: string): Promise<BikeStation | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const station = mockStations.find(station => station.id === stationId);
  return station ? { ...station } : null;
};

// Get bikes by station ID
export const getBikesByStation = async (stationId: string): Promise<Bike[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const stationBikes = mockBikes.filter(bike => bike.stationId === stationId && bike.available);
  return stationBikes.map(bike => ({ ...bike }));
};

// Get active rental from storage
const getStoredActiveRental = async (): Promise<ActiveRental | null> => {
  try {
    const rentalData = await AsyncStorage.getItem(ACTIVE_RENTAL_KEY);
    return rentalData ? JSON.parse(rentalData) : null;
  } catch (error) {
    console.error('Error getting active rental:', error);
    return null;
  }
};

// Save active rental to storage
const saveActiveRental = async (rental: ActiveRental | null): Promise<void> => {
  try {
    if (rental) {
      await AsyncStorage.setItem(ACTIVE_RENTAL_KEY, JSON.stringify(rental));
    } else {
      await AsyncStorage.removeItem(ACTIVE_RENTAL_KEY);
    }
  } catch (error) {
    console.error('Error saving active rental:', error);
  }
};

// Get rental history from storage
const getStoredRentalHistory = async (): Promise<RentalHistory[]> => {
  try {
    const historyData = await AsyncStorage.getItem(RENTAL_HISTORY_KEY);
    return historyData ? JSON.parse(historyData) : [...mockRentalHistory];
  } catch (error) {
    console.error('Error getting rental history:', error);
    return [...mockRentalHistory];
  }
};

// Save rental history to storage
const saveRentalHistory = async (history: RentalHistory[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(RENTAL_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving rental history:', error);
  }
};

// Start a bike rental
export const startRental = async (
    userId: string,
    bikeId: string,
    bikeName: string,
    stationId: string,
    stationName: string
): Promise<ActiveRental> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create active rental
  const startTime = new Date().toISOString();
  const rental: ActiveRental = {
    id: `rental${Date.now()}`,
    bikeId,
    bikeName,
    startTime,
    startStation: stationName,
    stationId,
    currentCost: 0
  };

  // Save to storage
  await saveActiveRental(rental);

  return rental;
};

// End a bike rental
export const endRental = async (
    userId: string,
    activeRentalId: string,
    endStationId: string
): Promise<RentalHistory> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Get active rental
  const activeRental = await getStoredActiveRental();

  if (!activeRental) {
    throw new Error('No active rental found');
  }

  // Get end station
  const endStation = mockStations.find(station => station.id === endStationId);

  if (!endStation) {
    throw new Error('End station not found');
  }

  // Calculate rental details
  const endTime = new Date().toISOString();
  const startDate = new Date(activeRental.startTime);
  const endDate = new Date(endTime);

  // Calculate duration in minutes
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const durationStr = `${hours}h ${minutes}m`;

  // Calculate cost based on duration
  const cost = Math.max(20, Math.ceil(durationMinutes / 60) * 20);

  // Calculate random distance between 1-10 km
  const distance = parseFloat((Math.random() * 9 + 1).toFixed(1));

  // Create rental history record
  const rentalHistory: RentalHistory = {
    id: `history${Date.now()}`,
    bikeId: activeRental.bikeId,
    bikeName: activeRental.bikeName,
    startTime: activeRental.startTime,
    endTime,
    startStation: activeRental.startStation,
    endStation: endStation.name,
    duration: durationStr,
    cost,
    distance,
  };

  // Update rental history
  const history = await getStoredRentalHistory();
  const updatedHistory = [rentalHistory, ...history];
  await saveRentalHistory(updatedHistory);

  // Clear active rental
  await saveActiveRental(null);

  return rentalHistory;
};

// Get rental history for a user
export const getRentalHistory = async (userId: string): Promise<RentalHistory[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Get from storage
  return await getStoredRentalHistory();
};

// Get active rental for a user
export const getActiveRental = async (userId: string): Promise<ActiveRental | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Get from storage
  return await getStoredActiveRental();
};