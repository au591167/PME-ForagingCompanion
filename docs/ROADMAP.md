nte# Foraging Companion App - Development Roadmap

## Overview
"Foraging Companion" is a React Native app built with Expo for tracking wild plants during foraging activities. Users can mark plant locations on a map, capture photos and audio notes, identify species via API, connect to wearables, and store data locally.

## Theme and Features
- **Core Theme**: Assist foragers in discovering, identifying, and remembering plant locations safely.
- **Target Features** (implemented in order):
  1. Location/Map services (with custom markers)
  2. Accelerometer (step tracking)
  3. Camera and Sound features
  4. Network features (plant identification API)
  5. Bluetooth integration
  6. Database integration
  7. Home landing page
  8. Custom map markers with names and icons

## Development Phases

### 1. Project Setup
- [x] Create base Expo app with TypeScript template.
- [x] Set up basic navigation (React Navigation: tabs for Map, Plants, Profile).
- [x] Install core dependencies (e.g., @react-navigation/native, react-native-screens).
- [ ] Initialize Git repository for version control.

### 2. Location/Map Services
- [x] Integrate Expo Location API for GPS permissions and current position.
- [x] Add map display using react-native-maps.
- [x] Implement marker placement for plant locations.
- [ ] Add route tracking for foraging paths.
- [x] Test on device for accuracy.

### 3. Accelerometer Integration
- [x] Use Expo Sensors for accelerometer data.
- [x] Implement step counting or motion detection.
- [x] Display activity metrics in the UI (e.g., steps during a trip).
- [ ] Handle sensor permissions and background tracking.

### 4. Camera and Sound Features
- [x] Integrate Expo Camera for photo capture of plants.
- [x] Add Expo Audio for recording audio notes.
- [x] Allow attaching media to plant entries.
- [x] Implement media preview and playback.

### 5. Network Features
- [x] Integrate PlantNet API for plant identification from photos.
- [x] Add safety disclaimers (e.g., "Identification is not guaranteed; consult experts").
- [x] Implement API calls for uploading images and receiving species data.
- [x] Handle network errors and offline scenarios.

### 6. Bluetooth Integration
- [ ] Add react-native-ble-plx for Bluetooth connectivity.
- [ ] Implement connection to wearables (e.g., heart rate monitors).
- [ ] Sync data from connected devices.
- [ ] Manage Bluetooth permissions and device pairing.

### 7. Database Integration
- [x] Use expo-sqlite for local database storage.
- [x] Create tables for plants (location, photos, notes, ID).
- [x] Implement CRUD operations for plant entries.
- [x] Add markers table for custom map markers.
- [ ] Add data export/import functionality.

### 7.5. UI Enhancements
- [x] Add Home landing page with navigation buttons.
- [x] Implement custom map markers with names and icons (tree, berry, leaf).
- [x] Allow removing markers by tapping.

### 8. Testing and Iteration
- [ ] Unit tests for each feature using Jest.
- [ ] Device testing on Android/iOS emulators and physical devices.
- [ ] UI/UX testing for usability and accessibility.
- [ ] Performance optimization and bug fixes.

### 9. Finalization
- [ ] Polish UI/UX with consistent styling and icons.
- [ ] Add app icons, splash screen, and themes.
- [ ] Implement offline support and data synchronization.
- [ ] Prepare for app store submission or demo.

## Learning Objectives
- Master React Native and Expo fundamentals.
- Learn mobile-specific APIs (location, sensors, camera, etc.).
- Understand Bluetooth and database integration.
- Practice iterative development, testing, and UI design.

## Notes
- Ensure all features include proper error handling and user permissions.
- Prioritize safety: Add warnings for foraging risks and API limitations.
- Track progress by checking off items in this roadmap.
