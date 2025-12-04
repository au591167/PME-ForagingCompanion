import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { globalStyles } from '../styles/globalStyles';
import { openBluetoothSettings, getBluetoothStatusMessage, getBluetoothInstructions, getSuggestedWearables } from '../services/bluetoothService';
import { getAllForagingSessions, ForagingSession } from '../database';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ForagingSession[]>([]);
  const [showBluetoothInfo, setShowBluetoothInfo] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userName');
        if (storedName) {
          setUserName(storedName);
        }
        const storedPic = await AsyncStorage.getItem('profilePic');
        if (storedPic) {
          setProfilePic(storedPic);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadUserData();
    loadSessions();
  }, []);

  const loadSessions = () => {
    const allSessions = getAllForagingSessions();
    setSessions(allSessions.slice(0, 5)); // Show last 5 sessions
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const saveUserName = async () => {
    try {
      await AsyncStorage.setItem('userName', userName);
      Alert.alert('Success', 'User name saved!');
    } catch (error) {
      console.error('Failed to save user name:', error);
      Alert.alert('Error', 'Failed to save user name.');
    }
  };

  const saveProfilePic = async () => {
    try {
      if (profilePic) {
        await AsyncStorage.setItem('profilePic', profilePic);
        Alert.alert('Success', 'Profile picture saved!');
      }
    } catch (error) {
      console.error('Failed to save profile pic:', error);
      Alert.alert('Error', 'Failed to save profile picture.');
    }
  };

  const handleBluetoothPress = () => {
    setShowBluetoothInfo(!showBluetoothInfo);
  };

  const handleOpenBluetoothSettings = async () => {
    await openBluetoothSettings();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters} m`;
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => (navigation as any).navigate('Home')} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Profile & Settings</Text>
      
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        {profilePic && <Image source={{ uri: profilePic }} style={styles.profileImage} />}
        <Button title="Pick Profile Picture" onPress={pickImage} />
        <Button title="Save Profile Picture" onPress={saveProfilePic} />
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={userName}
          onChangeText={setUserName}
        />
        <Button title="Save Name" onPress={saveUserName} />
      </View>

      {/* Bluetooth Section */}
      <View style={styles.section}>
        <TouchableOpacity onPress={handleBluetoothPress} style={styles.sectionHeader}>
          <FontAwesome name="bluetooth" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Bluetooth Settings</Text>
          <FontAwesome name={showBluetoothInfo ? "chevron-up" : "chevron-down"} size={16} color="#666" />
        </TouchableOpacity>
        
        {showBluetoothInfo && (
          <View style={styles.bluetoothInfo}>
            <Text style={styles.infoText}>{getBluetoothStatusMessage()}</Text>
            
            <TouchableOpacity style={styles.bluetoothButton} onPress={handleOpenBluetoothSettings}>
              <FontAwesome name="bluetooth-b" size={20} color="white" />
              <Text style={styles.bluetoothButtonText}>Open Bluetooth Settings</Text>
            </TouchableOpacity>

            <Text style={styles.instructionsTitle}>Instructions:</Text>
            {getBluetoothInstructions().map((instruction, index) => (
              <Text key={index} style={styles.instructionText}>{instruction}</Text>
            ))}

            <Text style={styles.instructionsTitle}>Suggested Wearables:</Text>
            {getSuggestedWearables().map((device, index) => (
              <View key={index} style={styles.deviceItem}>
                <Text style={styles.deviceName}>• {device.name}</Text>
                <Text style={styles.devicePurpose}>{device.purpose}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Activity History Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Foraging Sessions</Text>
        {sessions.length === 0 ? (
          <Text style={styles.noDataText}>No foraging sessions yet. Start tracking your trips!</Text>
        ) : (
          sessions.map((session, index) => (
            <View key={session.id || index} style={styles.sessionCard}>
              <Text style={styles.sessionDate}>
                {new Date(session.startTime).toLocaleDateString()} at {new Date(session.startTime).toLocaleTimeString()}
              </Text>
              <View style={styles.sessionStats}>
                <View style={styles.statItem}>
                  <FontAwesome name="street-view" size={16} color="#4CAF50" />
                  <Text style={styles.statText}>{session.steps} steps</Text>
                </View>
                <View style={styles.statItem}>
                  <FontAwesome name="road" size={16} color="#4CAF50" />
                  <Text style={styles.statText}>{formatDistance(session.distance)}</Text>
                </View>
                <View style={styles.statItem}>
                  <FontAwesome name="fire" size={16} color="#4CAF50" />
                  <Text style={styles.statText}>{session.calories} cal</Text>
                </View>
                <View style={styles.statItem}>
                  <FontAwesome name="clock-o" size={16} color="#4CAF50" />
                  <Text style={styles.statText}>{formatDuration(session.duration)}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  section: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    flex: 1,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  bluetoothInfo: {
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  bluetoothButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    gap: 10,
  },
  bluetoothButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  deviceItem: {
    marginBottom: 10,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  devicePurpose: {
    fontSize: 12,
    color: '#666',
    marginLeft: 15,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  sessionCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  sessionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: '45%',
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
});

export default ProfileScreen;
