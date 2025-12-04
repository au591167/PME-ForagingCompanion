// Network Service - Handles all network-related functionality
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { API_CONFIG, isPlantNetConfigured, isWeatherConfigured } from '../config/apiConfig';

// Network Status
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

// Weather Data Interface
export interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  location: string;
}

// Plant Identification Interface
export interface PlantIdentification {
  scientificName: string;
  commonNames: string[];
  family: string;
  genus: string;
  score: number;
  images: string[];
}

// Check network connectivity
export const checkNetworkStatus = async (): Promise<NetworkStatus> => {
  const state = await NetInfo.fetch();
  return {
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable,
    type: state.type,
  };
};

// Subscribe to network status changes
export const subscribeToNetworkStatus = (callback: (status: NetworkStatus) => void) => {
  return NetInfo.addEventListener(state => {
    callback({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    });
  });
};

// Get weather data using Open-Meteo (no API key required!)
export const getWeatherData = async (latitude: number, longitude: number): Promise<WeatherData> => {
  try {
    const response = await axios.get(
      `${API_CONFIG.OPEN_METEO_BASE_URL}/forecast`,
      {
        params: {
          latitude,
          longitude,
          current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
          timezone: 'auto',
        },
        timeout: API_CONFIG.TIMEOUT,
      }
    );

    const current = response.data.current;
    const weatherCode = current.weather_code;
    
    // Map weather codes to descriptions
    const weatherDescriptions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Rain showers',
      95: 'Thunderstorm',
    };

    return {
      temperature: Math.round(current.temperature_2m),
      description: weatherDescriptions[weatherCode] || 'Unknown',
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      icon: getWeatherIcon(weatherCode),
      location: 'Current Location',
    };
  } catch (error) {
    console.error('Weather API Error:', error);
    throw new Error('Failed to fetch weather data. Please check your internet connection.');
  }
};

// Get weather icon based on weather code
const getWeatherIcon = (code: number): string => {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2 || code === 3) return '⛅';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌦️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 75) return '❄️';
  if (code === 80) return '🌧️';
  if (code === 95) return '⛈️';
  return '🌤️';
};

// Identify plant using PlantNet API
export const identifyPlant = async (imageUri: string): Promise<PlantIdentification> => {
  try {
    // Check if API key is configured
    if (!isPlantNetConfigured()) {
      // Return mock data if API key is not configured
      return getMockPlantIdentification();
    }

    // Create form data for image upload
    const formData = new FormData();
    formData.append('images', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'plant.jpg',
    } as any);

    const response = await axios.post(
      `${API_CONFIG.PLANTNET_BASE_URL}/identify/all`,
      formData,
      {
        params: {
          'api-key': API_CONFIG.PLANTNET_API_KEY,
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: API_CONFIG.TIMEOUT,
      }
    );

    const result = response.data.results[0];
    return {
      scientificName: result.species.scientificNameWithoutAuthor,
      commonNames: result.species.commonNames || [],
      family: result.species.family.scientificNameWithoutAuthor,
      genus: result.genus.scientificNameWithoutAuthor,
      score: Math.round(result.score * 100),
      images: result.images.map((img: any) => img.url.o),
    };
  } catch (error) {
    console.error('PlantNet API Error:', error);
    // Fallback to mock data if API fails
    return getMockPlantIdentification();
  }
};

// Mock plant identification for testing/demo
const getMockPlantIdentification = (): PlantIdentification => {
  const mockPlants = [
    {
      scientificName: 'Vaccinium corymbosum',
      commonNames: ['Blueberry', 'Highbush Blueberry'],
      family: 'Ericaceae',
      genus: 'Vaccinium',
      score: 85,
      images: [],
    },
    {
      scientificName: 'Fragaria vesca',
      commonNames: ['Wild Strawberry', 'Woodland Strawberry'],
      family: 'Rosaceae',
      genus: 'Fragaria',
      score: 78,
      images: [],
    },
    {
      scientificName: 'Rubus idaeus',
      commonNames: ['Raspberry', 'Red Raspberry'],
      family: 'Rosaceae',
      genus: 'Rubus',
      score: 92,
      images: [],
    },
    {
      scientificName: 'Taraxacum officinale',
      commonNames: ['Dandelion', 'Common Dandelion'],
      family: 'Asteraceae',
      genus: 'Taraxacum',
      score: 88,
      images: [],
    },
  ];

  return mockPlants[Math.floor(Math.random() * mockPlants.length)];
};

// Check if foraging conditions are good based on weather
export const getForagingConditions = (weather: WeatherData): {
  isGood: boolean;
  message: string;
  icon: string;
} => {
  const temp = weather.temperature;
  const desc = weather.description.toLowerCase();
  
  // Bad conditions
  if (desc.includes('rain') || desc.includes('storm') || desc.includes('snow')) {
    return {
      isGood: false,
      message: 'Not ideal - Weather is unfavorable for foraging',
      icon: '⚠️',
    };
  }
  
  if (temp < 5 || temp > 35) {
    return {
      isGood: false,
      message: 'Not ideal - Temperature is too extreme',
      icon: '🌡️',
    };
  }
  
  // Good conditions
  if (temp >= 15 && temp <= 25 && (desc.includes('clear') || desc.includes('partly'))) {
    return {
      isGood: true,
      message: 'Perfect conditions for foraging!',
      icon: '✅',
    };
  }
  
  // Moderate conditions
  return {
    isGood: true,
    message: 'Acceptable conditions for foraging',
    icon: '👍',
  };
};
