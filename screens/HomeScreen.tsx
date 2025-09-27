import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../styles/globalStyles';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('User');

  const loadUserName = async () => {
    try {
      const storedName = await AsyncStorage.getItem('userName');
      if (storedName) {
        setUsername(storedName);
      }
    } catch (error) {
      console.error('Failed to load user name:', error);
    }
  };

  useEffect(() => {
    loadUserName();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserName();
    }, [])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const navigateToScreen = (screenName: string, action?: string) => {
    if (action === 'savePlant') {
      (navigation as any).navigate('MainTabs', { screen: 'Plants' });
    } else if (action === 'gallery') {
      (navigation as any).navigate('MainTabs', { screen: 'Gallery' });
    } else if (action === 'savedLocations') {
      (navigation as any).navigate('MainTabs', { screen: 'Map' });
    } else if (action === 'profile') {
      (navigation as any).navigate('MainTabs', { screen: 'Profile' });
    }
  };

  const primaryColor = '#4CAF50';

  return (
    <View style={globalStyles.container}>
      <View style={styles.greetingCard}>
        <Text style={styles.greeting}>Good {getGreeting()}, {username}</Text>
      </View>

      <View style={styles.buttonGrid}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigateToScreen('Map', 'savePlant')}
          accessibilityLabel="Save a new plant"
        >
          <FontAwesome name="camera" size={40} color="white" />
          <Text style={styles.buttonText}>Save a Plant</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigateToScreen('Gallery', 'gallery')}
          accessibilityLabel="Open gallery"
        >
          <FontAwesome name="picture-o" size={40} color="white" />
          <Text style={styles.buttonText}>Open Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigateToScreen('Plants', 'savedLocations')}
          accessibilityLabel="Open saved locations"
        >
          <FontAwesome name="map-marker" size={40} color="white" />
          <Text style={styles.buttonText}>Open Saved Locations</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigateToScreen('Profile', 'profile')}
          accessibilityLabel="Profile settings"
        >
          <FontAwesome name="user" size={40} color="white" />
          <Text style={styles.buttonText}>Profile Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  greetingCard: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    margin: 10,
    marginTop: Dimensions.get('window').height * 0.15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: Dimensions.get('window').height * 0.15,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  buttonGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 15,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default HomeScreen;
