// Bluetooth Service - Simple Bluetooth settings launcher
import { Linking, Platform, Alert } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

// Check if Bluetooth is available on the device
export const isBluetoothAvailable = (): boolean => {
  // Bluetooth is available on all modern mobile devices
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

// Open system Bluetooth settings
export const openBluetoothSettings = async (): Promise<void> => {
  try {
    if (Platform.OS === 'android') {
      // Android: Open Bluetooth settings using Intent Launcher
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.BLUETOOTH_SETTINGS
      );
    } else if (Platform.OS === 'ios') {
      // iOS: Open app settings (iOS doesn't allow direct Bluetooth settings access)
      const url = 'App-Prefs:Bluetooth';
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to general settings
        await Linking.openSettings();
      }
    } else {
      Alert.alert(
        'Not Supported',
        'Bluetooth settings are only available on mobile devices.'
      );
    }
  } catch (error) {
    console.error('Error opening Bluetooth settings:', error);
    Alert.alert(
      'Error',
      'Could not open Bluetooth settings. Please open them manually from your device settings.'
    );
  }
};

// Get Bluetooth status message
export const getBluetoothStatusMessage = (): string => {
  if (Platform.OS === 'android') {
    return 'Tap to open Bluetooth settings and connect to wearable devices like heart rate monitors or fitness trackers.';
  } else if (Platform.OS === 'ios') {
    return 'Tap to open settings. Enable Bluetooth to connect to wearable devices.';
  }
  return 'Bluetooth is not available on this platform.';
};

// Get platform-specific instructions
export const getBluetoothInstructions = (): string[] => {
  if (Platform.OS === 'android') {
    return [
      '1. Tap the button below to open Bluetooth settings',
      '2. Turn on Bluetooth if it\'s off',
      '3. Pair with your wearable device (heart rate monitor, fitness tracker, etc.)',
      '4. Return to the app to continue foraging',
    ];
  } else if (Platform.OS === 'ios') {
    return [
      '1. Tap the button below to open settings',
      '2. Navigate to Bluetooth settings',
      '3. Turn on Bluetooth if it\'s off',
      '4. Pair with your wearable device',
      '5. Return to the app to continue foraging',
    ];
  }
  return ['Bluetooth is not available on this platform.'];
};

// Future enhancement: Check if specific device types are connected
export const getConnectedDeviceTypes = (): string[] => {
  // This would require react-native-ble-plx for actual implementation
  // For now, return empty array as we're just opening settings
  return [];
};

// Get suggested wearable devices for foraging
export const getSuggestedWearables = (): Array<{ name: string; purpose: string }> => {
  return [
    {
      name: 'Heart Rate Monitor',
      purpose: 'Track physical exertion during foraging trips',
    },
    {
      name: 'Fitness Tracker',
      purpose: 'Monitor steps, distance, and calories burned',
    },
    {
      name: 'Smart Watch',
      purpose: 'Receive notifications and track activity',
    },
    {
      name: 'GPS Tracker',
      purpose: 'Enhanced location tracking for remote areas',
    },
  ];
};
