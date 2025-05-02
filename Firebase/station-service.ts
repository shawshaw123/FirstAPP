import { BikeStation, Bike } from "@/components";

// Mock data for stations
const MOCK_STATIONS: BikeStation[] = [
  {
    id: "station1",
    name: "Main Campus Station",
    latitude: 14.6042,
    longitude: 120.9822,
    availableBikes: 8,
    emptySlots: 4,
    distance: 0.2,
    isActive: true,
  },
  {
    id: "station2",
    name: "Engineering Building",
    latitude: 14.6052,
    longitude: 120.9832,
    availableBikes: 3,
    emptySlots: 9,
    distance: 0.5,
    isActive: true,
  },
  {
    id: "station3",
    name: "Student Center",
    latitude: 14.6062,
    longitude: 120.9842,
    availableBikes: 0,
    emptySlots: 12,
    distance: 0.8,
    isActive: true,
  },
  {
    id: "station4",
    name: "Library Station",
    latitude: 14.6072,
    longitude: 120.9852,
    availableBikes: 5,
    emptySlots: 7,
    distance: 1.2,
    isActive: true,
  },
  {
    id: "station5",
    name: "Sports Complex",
    latitude: 14.6082,
    longitude: 120.9862,
    availableBikes: 10,
    emptySlots: 2,
    distance: 1.5,
    isActive: true,
  },
];

// Mock data for bikes
const MOCK_BIKES: Bike[] = [
  {
    id: "bike1",
    name: "Mountain Bike A",
    stationId: "station1",
    isAvailable: true,
    isElectric: false,
    batteryLevel: 0,
    pricePerHour: 20,
  },
  {
    id: "bike2",
    name: "Electric Bike B",
    stationId: "station1",
    isAvailable: true,
    isElectric: true,
    batteryLevel: 85,
    pricePerHour: 30,
  },
  {
    id: "bike3",
    name: "City Bike C",
    stationId: "station1",
    isAvailable: true,
    isElectric: false,
    batteryLevel: 0,
    pricePerHour: 20,
  },
  {
    id: "bike4",
    name: "Electric Bike D",
    stationId: "station1",
    isAvailable: true,
    isElectric: true,
    batteryLevel: 65,
    pricePerHour: 30,
  },
  {
    id: "bike5",
    name: "Mountain Bike E",
    stationId: "station1",
    isAvailable: true,
    isElectric: false,
    batteryLevel: 0,
    pricePerHour: 20,
  },
  {
    id: "bike6",
    name: "Electric Bike F",
    stationId: "station1",
    isAvailable: true,
    isElectric: true,
    batteryLevel: 92,
    pricePerHour: 30,
  },
  {
    id: "bike7",
    name: "City Bike G",
    stationId: "station1",
    isAvailable: true,
    isElectric: false,
    batteryLevel: 0,
    pricePerHour: 20,
  },
  {
    id: "bike8",
    name: "Electric Bike H",
    stationId: "station1",
    isAvailable: true,
    isElectric: true,
    batteryLevel: 45,
    pricePerHour: 30,
  },
  {
    id: "bike9",
    name: "Mountain Bike I",
    stationId: "station2",
    isAvailable: true,
    isElectric: false,
    batteryLevel: 0,
    pricePerHour: 20,
  },
  {
    id: "bike10",
    name: "Electric Bike J",
    stationId: "station2",
    isAvailable: true,
    isElectric: true,
    batteryLevel: 78,
    pricePerHour: 30,
  },
  {
    id: "bike11",
    name: "City Bike K",
    stationId: "station2",
    isAvailable: true,
    isElectric: false,
    batteryLevel: 0,
    pricePerHour: 20,
  },
  {
    id: "bike12",
    name: "Electric Bike L",
    stationId: "station4",
    isAvailable: true,
    isElectric: true,
    batteryLevel: 88,
    pricePerHour: 30,
  },
  {
    id: "bike13",
    name: "Mountain Bike M",
    stationId: "station4",
    isAvailable: true,
    isElectric: false,
    batteryLevel: 0,
    pricePerHour: 20,
  },
  {
    id: "bike14",
    name: "Electric Bike N",
    stationId: "station4",
    isAvailable: true,
    isElectric: true,
    batteryLevel: 55,
    pricePerHour: 30,
  },
  {
    id: "bike15",
    name: "City Bike O",
    stationId: "station4",
    isAvailable: true,
    isElectric: false,
    batteryLevel: 0,
    pricePerHour: 20,
  },
  {
    id: "bike16",
    name: "Electric Bike P",
    stationId: "station4",
    isAvailable: true,
    isElectric: true,
    batteryLevel: 72,
    pricePerHour: 30,
  },
  {
    id: "bike17",
    name: "Mountain Bike Q",
    stationId: "station5",
    isAvailable: true,
    isElectric: false,
    batteryLevel: 0,
    pricePerHour: 20,
  },
  {
    id: "bike18",
    name: "Electric Bike R",
    stationId: "station5",
    isAvailable: true,
    isElectric: true,
    batteryLevel: 95,
    pricePerHour: 30,
  },
  {
    id: "bike19",
    name: "City Bike S",
    stationId: "station5",
    isAvailable: true,
    isElectric: false,
    batteryLevel: 0,
    pricePerHour: 20,
  },
  {
    id: "bike20",
    name: "Electric Bike T",
    stationId: "station5",
    isAvailable: true,
    isElectric: true,
    batteryLevel: 82,
    pricePerHour: 30,
  },
];

// Get all stations
export const getStations = async (): Promise<BikeStation[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return MOCK_STATIONS;
};

// Get station by ID
export const getStationById = async (stationId: string): Promise<BikeStation> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const station = MOCK_STATIONS.find(station => station.id === stationId);

  if (!station) {
    throw new Error("Station not found");
  }

  return station;
};

// Get bikes by station ID
export const getBikesByStation = async (stationId: string): Promise<Bike[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  const bikes = MOCK_BIKES.filter(bike => bike.stationId === stationId && bike.isAvailable);

  return bikes;
};

// Get bike by ID
export const getBikeById = async (bikeId: string): Promise<Bike> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const bike = MOCK_BIKES.find(bike => bike.id === bikeId);

  if (!bike) {
    throw new Error("Bike not found");
  }

  return bike;
};