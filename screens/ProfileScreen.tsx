import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { globalStyles } from '../styles/globalStyles';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const loadUserName = async () => {
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
    loadUserName();
  }, []);

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

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => (navigation as any).navigate('Home')} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      <Text style={globalStyles.title}>Profile Screen</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '80%',
  },
});

export default ProfileScreen;
