import { BikeStation, Bike, RentalHistory } from "@/components";

export const stations: BikeStation[] = [
  {
    id: "station1",
    name: "Library building",
    availableBikes: 7,
    emptySlots: 8,
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    distance: 0.2,
  },
  {
    id: "station2",
    name: "CISC",
    availableBikes: 5,
    emptySlots: 10,
    location: {
      latitude: 37.7750,
      longitude: -122.4180,
    },
    distance: 0.5,
  },
  {
    id: "station3",
    name: "Engineering",
    availableBikes: 3,
    emptySlots: 12,
    location: {
      latitude: 37.7752,
      longitude: -122.4170,
    },
    distance: 0.8,
  },
];

export const bikes: Bike[] = [
  {
    id: "bike1",
    name: "FORDA-EBIKE-1",
    stationId: "station1",
    available: true,
  },
  {
    id: "bike2",
    name: "FORDA-EBIKE-2",
    stationId: "station1",
    available: true,
  },
  {
    id: "bike3",
    name: "FORDA-EBIKE-3",
    stationId: "station2",
    available: true,
  },
  {
    id: "bike4",
    name: "FORDA-EBIKE-4",
    stationId: "station2",
    available: true,
  },
  {
    id: "bike5",
    name: "FORDA-EBIKE-5",
    stationId: "station3",
    available: true,
  },
];

export const rentalHistory: RentalHistory[] = [
  {
    id: "rental1",
    bikeId: "bike1",
    bikeName: "Bike #1",
    startTime: "2025-04-12T07:30:00",
    endTime: "2025-04-12T08:30:00",
    startStation: "Station 1",
    endStation: "Station 2",
    duration: "1h 0m",
    cost: 40,
    distance: 2.3,
  },
  {
    id: "rental2",
    bikeId: "bike2",
    bikeName: "Bike #2",
    startTime: "2025-04-13T13:30:00",
    endTime: "2025-04-13T15:50:00",
    startStation: "Station 2",
    endStation: "Station 3",
    duration: "2h 20m",
    cost: 80,
    distance: 5.3,
  },
];

export const pricingPlans = [
  { duration: "1 hour", price: 20 },
  { duration: "2 hours", price: 30 },
  { duration: "3 hours", price: 40 },
  { duration: "Open time", price: 40, perHour: true },
];