import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image, Alert, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { globalStyles } from '../styles/globalStyles';
import { savePlantEntry } from '../database';
import { 
  identifyPlant, 
  getWeatherData, 
  getForagingConditions, 
  checkNetworkStatus,
  subscribeToNetworkStatus,
  NetworkStatus,
  WeatherData 
} from '../services/networkService';

const PlantsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [soundUri, setSoundUri] = useState<string | null>(null);
  const [identification, setIdentification] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
      
      // Check network status
      const status2 = await checkNetworkStatus();
      setNetworkStatus(status2);
      
      // Subscribe to network changes
      const unsubscribe = subscribeToNetworkStatus((status) => {
        setNetworkStatus(status);
      });
      
      return () => unsubscribe();
    })();
  }, []);

  useEffect(() => {
    // Load weather when location is available
    if (location && networkStatus?.isConnected) {
      loadWeather();
    }
  }, [location, networkStatus]);

  const loadWeather = async () => {
    if (!location) return;
    
    setIsLoadingWeather(true);
    try {
      const weatherData = await getWeatherData(location.latitude, location.longitude);
      setWeather(weatherData);
    } catch (error) {
      console.error('Failed to load weather:', error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      Alert.alert('Photo taken!', 'Photo saved locally.');
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recording?.stopAndUnloadAsync();
    const uri = recording?.getURI();
    setSoundUri(uri || null);
    Alert.alert('Recording saved!', 'Audio note saved locally.');
  };

  const playSound = async () => {
    if (soundUri) {
      const { sound } = await Audio.Sound.createAsync({ uri: soundUri });
      await sound.playAsync();
    }
  };

  const handleIdentifyPlant = async () => {
    if (!photoUri) {
      Alert.alert('No photo', 'Take a photo first.');
      return;
    }

    // Check network status
    if (!networkStatus?.isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Plant identification requires an internet connection. The request will be saved and processed when you\'re back online.',
        [
          { text: 'OK' },
          { text: 'Save Offline', onPress: () => saveOffline() }
        ]
      );
      return;
    }

    setIsIdentifying(true);
    
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied', 'Cannot save location.');
        setIsIdentifying(false);
        return;
      }
      
      const locationResult = await Location.getCurrentPositionAsync({});
      const currentLocation = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };
      setLocation(currentLocation);

      // Identify plant using PlantNet API (or mock data)
      const result = await identifyPlant(photoUri);
      
      const identText = `${result.scientificName}\n` +
        `Common Names: ${result.commonNames.join(', ') || 'Unknown'}\n` +
        `Family: ${result.family}\n` +
        `Confidence: ${result.score}%\n\n` +
        `⚠️ DISCLAIMER: This identification is AI-generated and may not be accurate. ` +
        `Never consume any plant without expert verification. Some plants are toxic or deadly.`;
      
      setIdentification(identText);

      // Save to database
      savePlantEntry({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        photoUri,
        soundUri: soundUri || undefined,
        identification: identText,
        timestamp: Date.now(),
      });

      Alert.alert(
        'Plant Identified!', 
        `Found: ${result.scientificName}\nConfidence: ${result.score}%\n\nSaved to gallery!`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Identification Error', message);
    } finally {
      setIsIdentifying(false);
    }
  };

  const saveOffline = () => {
    Alert.alert('Offline Mode', 'Offline saving not yet implemented. Please connect to internet.');
  };

  if (hasCameraPermission === null) {
    return <View style={globalStyles.container}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasCameraPermission === false) {
    return <View style={globalStyles.container}><Text>No access to camera</Text></View>;
  }

  const foragingConditions = weather ? getForagingConditions(weather) : null;

  return (
    <ScrollView style={globalStyles.container}>
      <TouchableOpacity onPress={() => (navigation as any).navigate('Home')} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      
      {/* Network Status Indicator */}
      <View style={[styles.networkStatus, { backgroundColor: networkStatus?.isConnected ? '#4CAF50' : '#f44336' }]}>
        <FontAwesome 
          name={networkStatus?.isConnected ? "wifi" : "exclamation-triangle"} 
          size={16} 
          color="white" 
        />
        <Text style={styles.networkStatusText}>
          {networkStatus?.isConnected ? 'Online' : 'Offline'} - {networkStatus?.type}
        </Text>
      </View>

      {/* Weather Card */}
      {weather && (
        <View style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            <Text style={styles.weatherIcon}>{weather.icon}</Text>
            <View style={styles.weatherInfo}>
              <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
              <Text style={styles.weatherDesc}>{weather.description}</Text>
            </View>
          </View>
          <View style={styles.weatherDetails}>
            <Text style={styles.weatherDetail}>💧 Humidity: {weather.humidity}%</Text>
            <Text style={styles.weatherDetail}>💨 Wind: {weather.windSpeed} km/h</Text>
          </View>
          {foragingConditions && (
            <View style={[styles.foragingConditions, { backgroundColor: foragingConditions.isGood ? '#e8f5e9' : '#fff3e0' }]}>
              <Text style={styles.conditionIcon}>{foragingConditions.icon}</Text>
              <Text style={styles.conditionText}>{foragingConditions.message}</Text>
            </View>
          )}
        </View>
      )}

      <Text style={globalStyles.title}>Identify Plant</Text>
      
      {/* Camera Preview - Always Visible with Fixed Height */}
      <View style={styles.cameraContainer}>
        <CameraView style={styles.cameraView} ref={cameraRef} />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraHint}>📸 Frame the plant in view</Text>
        </View>
      </View>
      
      <View style={styles.controls}>
        <Button title="📷 Take Photo" onPress={takePhoto} />
        
        {photoUri && (
          <View style={styles.photoPreview}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
            <Button title="❌ Remove Photo" onPress={() => setPhotoUri(null)} color="red" />
          </View>
        )}
        
        <Button
          title={isRecording ? "⏹️ Stop Recording" : "🎤 Record Audio Note"}
          onPress={isRecording ? stopRecording : startRecording}
        />
        
        {soundUri && (
          <View style={styles.audioControls}>
            <Button title="▶️ Play Audio" onPress={playSound} />
            <Button title="❌ Remove Audio" onPress={() => setSoundUri(null)} color="red" />
          </View>
        )}
        
        {photoUri && (
          <View style={styles.identifyButton}>
            {isIdentifying ? (
              <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
              <Button 
                title="🔍 Identify Plant" 
                onPress={handleIdentifyPlant}
                color="#4CAF50"
              />
            )}
          </View>
        )}
        
        {identification && (
          <View style={styles.identificationCard}>
            <Text style={styles.identificationTitle}>Identification Result:</Text>
            <Text style={styles.identificationText}>{identification}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  cameraContainer: {
    height: 300,
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  cameraView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cameraHint: {
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
  },
  networkStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  weatherCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weatherIcon: {
    fontSize: 48,
    marginRight: 15,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherDesc: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weatherDetail: {
    fontSize: 14,
    color: '#666',
  },
  foragingConditions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
  conditionIcon: {
    fontSize: 24,
  },
  conditionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  controls: {
    padding: 10,
  },
  photoPreview: {
    alignItems: 'center',
    marginVertical: 10,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  identifyButton: {
    marginVertical: 15,
  },
  identificationCard: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  identificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  identificationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
});

export default PlantsScreen;
