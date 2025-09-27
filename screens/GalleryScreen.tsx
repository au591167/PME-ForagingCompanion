import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Button, Alert, Linking, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { getAllPlantEntries, deletePlantEntry, PlantEntry } from '../database';
import { globalStyles } from '../styles/globalStyles';

const GalleryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [entries, setEntries] = useState<PlantEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const data = getAllPlantEntries();
    setEntries(data);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', onPress: () => {
        deletePlantEntry(id);
        loadEntries();
      }},
    ]);
  };

  const handleNavigate = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const renderItem = ({ item }: { item: PlantEntry }) => (
    <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
      <Image source={{ uri: item.photoUri }} style={{ width: 100, height: 100, margin: 10 }} />
      <Text>{item.identification}</Text>
      <Text>Location: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button title="Navigate" onPress={() => handleNavigate(item.latitude, item.longitude)} />
        <Button title="Delete" onPress={() => handleDelete(item.id!)} color="red" />
      </View>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity onPress={() => (navigation as any).navigate('Home')} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      <Text style={globalStyles.title}>Gallery</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ flex: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No saved plants yet.</Text>
          </View>
        }
      />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GalleryScreen;
