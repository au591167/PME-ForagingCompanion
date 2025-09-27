import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, Image, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { Audio } from 'expo-av';
import axios from 'axios';
import * as Location from 'expo-location';
import { globalStyles } from '../styles/globalStyles';
import { savePlantEntry } from '../database';

const PlantsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [soundUri, setSoundUri] = useState<string | null>(null);
  const [identification, setIdentification] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

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

  const identifyPlant = async () => {
    if (!photoUri) {
      Alert.alert('No photo', 'Take a photo first.');
      return;
    }
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied', 'Cannot save location.');
        return;
      }
      const locationResult = await Location.getCurrentPositionAsync({});
      const currentLocation = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };

      // Mock API call - in real app, use PlantNet API
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
      // Simulate identification
      const ident = 'Mock Identification: Blueberry Bush (Vaccinium corymbosum) - Edible, but verify with expert.';
      setIdentification(ident);

      // Save to database
      savePlantEntry({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        photoUri,
        soundUri: soundUri || undefined,
        identification: ident,
        timestamp: Date.now(),
      });

      Alert.alert('Identification', 'Plant identified and saved to gallery! See disclaimer.');
    } catch (error) {
      Alert.alert('Error', 'Network or location error.');
    }
  };

  if (hasCameraPermission === null) {
    return <View style={globalStyles.container}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasCameraPermission === false) {
    return <View style={globalStyles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity onPress={() => (navigation as any).navigate('Home')} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      <Text style={globalStyles.title}>Plants Screen</Text>
      <CameraView style={globalStyles.camera} ref={cameraRef} />
      <Button title="Take Photo" onPress={takePhoto} />
      {photoUri && <Image source={{ uri: photoUri }} style={{ width: 100, height: 100, margin: 10 }} />}
      {photoUri && <Button title="Remove Photo" onPress={() => setPhotoUri(null)} color="red" />}
      <Button
        title={isRecording ? "Stop Recording" : "Record Audio"}
        onPress={isRecording ? stopRecording : startRecording}
      />
      {soundUri && <Button title="Play Audio" onPress={playSound} />}
      {soundUri && <Button title="Remove Audio" onPress={() => setSoundUri(null)} color="red" />}
      {photoUri && <Button title="Identify Plant" onPress={identifyPlant} />}
      {identification && (
        <Text style={globalStyles.identification}>
          {identification}
          {'\n'}Disclaimer: This is not medical advice. Consult experts for edibility.
        </Text>
      )}
    </View>
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
});

export default PlantsScreen;
