// API Configuration File
// Add your API keys here

export const API_CONFIG = {
  // PlantNet API - Get your key at: https://my.plantnet.org/
  // Free tier: 500 requests/day
  PLANTNET_API_KEY: 'YOUR_PLANTNET_API_KEY_HERE',
  PLANTNET_BASE_URL: 'https://my-api.plantnet.org/v2',
  
  // OpenWeatherMap API - Get your key at: https://openweathermap.org/api
  // Free tier: 1000 requests/day
  WEATHER_API_KEY: 'YOUR_OPENWEATHER_API_KEY_HERE',
  WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  
  // Alternative: Open-Meteo (No API key required!)
  OPEN_METEO_BASE_URL: 'https://api.open-meteo.com/v1',
  
  // Network timeout settings
  TIMEOUT: 10000, // 10 seconds
};

// Helper function to check if API keys are configured
export const isPlantNetConfigured = (): boolean => {
  return API_CONFIG.PLANTNET_API_KEY !== 'YOUR_PLANTNET_API_KEY_HERE' && 
         API_CONFIG.PLANTNET_API_KEY.length > 0;
};

export const isWeatherConfigured = (): boolean => {
  return API_CONFIG.WEATHER_API_KEY !== 'YOUR_OPENWEATHER_API_KEY_HERE' && 
         API_CONFIG.WEATHER_API_KEY.length > 0;
};
