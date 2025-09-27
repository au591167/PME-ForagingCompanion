import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

import MapView, { Marker, Callout, LatLng, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { globalStyles } from '../styles/globalStyles';
import { Marker as MarkerType, getAllMarkers, saveMarker, deleteMarker } from '../database';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const MapScreen: React.FC = () => {
    const navigation = useNavigation();
    const mapRef = useRef<MapView>(null);
    const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
    const [region, setRegion] = useState<Region>({
      latitude: 56.2639, // Center of Denmark
      longitude: 9.5018,
      latitudeDelta: 2.0, // Broad view of Denmark
      longitudeDelta: 2.0,
    });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [markers, setMarkers] = useState<MarkerType[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [markerName, setMarkerName] = useState('');
    const [selectedCoordinate, setSelectedCoordinate] = useState<LocationCoords | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let locationResult = await Location.getCurrentPositionAsync({});
      const newLocation: LocationCoords = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };
      setCurrentLocation(newLocation);

      // Delay animate to current location by 2 seconds
      setTimeout(() => {
        if (newLocation && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }, 1000);
        }
      }, 2000);

      // Load markers from database
      const loadedMarkers = getAllMarkers();
      setMarkers(loadedMarkers);
    })();
  }, []);

  const centerOnCurrentLocation = () => {
    if (currentLocation) {
      setSelectedCoordinate(currentLocation);
      setMarkerName('');
      setShowAddModal(true);
    } else {
      Alert.alert('Location Error', 'Current location not available. Please wait for GPS to update.');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    let query = searchQuery.trim();

    try {
      // Use Nominatim API for more reliable geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=dk&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ForagingCompanion/1.0'
          }
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const searchRegion: Region = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(searchRegion);
        if (mapRef.current) {
          mapRef.current.animateToRegion(searchRegion, 1000);
        }
      } else {
        // Fallback: try appending ", Denmark"
        const fallbackQuery = query.includes(',') ? query : `${query}, Denmark`;
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&limit=1&countrycodes=dk&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'ForagingCompanion/1.0'
            }
          }
        );
        if (!fallbackResponse.ok) {
          throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
        }
        const fallbackData = await fallbackResponse.json();
        if (fallbackData && fallbackData.length > 0) {
          const { lat, lon } = fallbackData[0];
          const searchRegion: Region = {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          setRegion(searchRegion);
          if (mapRef.current) {
            mapRef.current.animateToRegion(searchRegion, 1000);
          }
        } else {
          Alert.alert('Search', 'No results found for the search query.');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert('Search Error', `Failed to search location: ${message}. Please check your internet connection.`);
    }
  };

  const addMarker = (coordinate: LocationCoords) => {
    setSelectedCoordinate(coordinate);
    setMarkerName('');
    setShowAddModal(true);
  };

  const handleAddMarker = () => {
    if (!markerName.trim()) {
      Alert.alert('Error', 'Please enter a name for the marker.');
      return;
    }
    const coord = selectedCoordinate || currentLocation;
    if (!coord) {
      Alert.alert('Error', 'No coordinate available.');
      return;
    }
    Alert.alert(
      'Select Icon',
      'Choose an icon for the marker',
      [
        { text: 'Tree 🌳', onPress: () => saveNewMarker(coord, markerName, '🌳') },
        { text: 'Berry 🍓', onPress: () => saveNewMarker(coord, markerName, '🍓') },
        { text: 'Leaf 🍃', onPress: () => saveNewMarker(coord, markerName, '🍃') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
    setShowAddModal(false);
  };

  const saveNewMarker = (coordinate: LocationCoords, name: string, icon: string) => {
    const newMarker: Omit<MarkerType, 'id'> = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      name,
      icon,
    };
    saveMarker(newMarker);
    setMarkers([...markers, { ...newMarker, id: Date.now() }]); // Temporary id
  };

  const removeMarker = (marker: MarkerType) => {
    Alert.alert(
      'Remove Marker',
      `Remove "${marker.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            if (marker.id) {
              deleteMarker(marker.id);
              setMarkers(markers.filter((m) => m.id !== marker.id));
            }
          },
        },
      ]
    );
  };

  if (errorMsg) {
    Alert.alert('Location Error', errorMsg);
  }

  return (
    <View style={globalStyles.mapContainer}>
      <TouchableOpacity onPress={() => (navigation as any).navigate('Home')} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="black" />
      </TouchableOpacity>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <FontAwesome name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Center Button */}
      <TouchableOpacity style={styles.centerButton} onPress={centerOnCurrentLocation}>
        <FontAwesome name="map-marker" size={24} color="white" />
      </TouchableOpacity>

      <MapView
        ref={mapRef}
        style={globalStyles.map}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
        onLongPress={(e) => addMarker(e.nativeEvent.coordinate as LocationCoords)}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation as LatLng}
            title="Your Location"
            description="Current position"
            pinColor="blue"
          />
        )}
        {markers.map((marker: MarkerType, index: number) => (
          <Marker
            key={marker.id || index}
            coordinate={marker as LatLng}
            title={`${marker.icon} ${marker.name}`}
            description="Tap to remove marker"
            onPress={() => removeMarker(marker)}
          >
            <Callout>
              <View>
                <Text>{marker.icon} {marker.name}</Text>
                <Text style={{ fontSize: 12, color: 'gray' }}>Foraging spot</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Add Marker Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Marker</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter marker name"
              value={markerName}
              onChangeText={setMarkerName}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.okButton]}
                onPress={handleAddMarker}
              >
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  okButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  okButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default MapScreen;
