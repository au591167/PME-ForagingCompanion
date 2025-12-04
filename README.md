# 🌿 Foraging Companion

A React Native mobile app for tracking and identifying wild plants during foraging activities. Built with Expo and TypeScript.

## 📱 Features

### 🌐 Network Integration
- **Real-time Weather Data** - Current conditions with foraging recommendations
- **Plant Identification** - AI-powered plant recognition via PlantNet API
- **Network Status** - Online/offline indicator with automatic detection
- **Smart Recommendations** - Weather-based foraging condition assessment

### 📍 Location & Mapping
- **Interactive Map** - Real-time GPS tracking with custom markers
- **Custom Markers** - Add named locations with icons (🌳 Tree, 🍓 Berry, 🍃 Leaf)
- **Location Search** - Find places using OpenStreetMap
- **Quick Actions** - Long-press to add markers, tap to remove

### 🏃 Activity Tracking
- **Step Counter** - Real-time step tracking during foraging sessions
- **Shake to Mark** - Quick-mark locations by shaking your phone
- **Activity Detection** - Automatic classification (Standing, Walking, Running, Sitting)
- **Session Tracking** - Start/stop sessions with metrics (steps, distance, calories, time)
- **Session History** - View past foraging trips in your profile

### 📸 Plant Documentation
- **Live Camera Preview** - Always-visible viewfinder for plant photography
- **Photo Capture** - High-quality plant photos with location data
- **Audio Notes** - Record voice observations about plants
- **Identification Results** - Detailed species information with confidence scores
- **Safety Disclaimers** - Clear warnings about plant consumption

### 📱 Bluetooth Support
- **Quick Settings Access** - One-tap to open Bluetooth settings
- **Wearable Integration** - Connect heart rate monitors and fitness trackers
- **Platform Optimized** - Native implementation for Android and iOS

### 💾 Data Management
- **Local Database** - SQLite storage for offline access
- **Plant Gallery** - Browse all saved plant entries
- **Session History** - Review past foraging activities
- **Navigation Links** - Direct Google Maps integration for saved locations

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Expo CLI
- Expo Go app (for testing on device)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

**On Physical Device:**
1. Install Expo Go from App Store or Google Play
2. Scan the QR code from the terminal
3. App will load on your device

**On Emulator:**
- Press `a` for Android emulator
- Press `i` for iOS simulator

## 📖 Usage Guide

### Home Screen
Navigate to different features using the four main buttons:
- **Save a Plant** - Open camera for plant identification
- **Open Gallery** - View saved plant entries
- **Open Saved Locations** - Access the map with markers
- **Profile Settings** - Manage Bluetooth and view session history

### Identifying Plants
1. Navigate to "Save a Plant"
2. Frame the plant in the camera preview
3. Tap "Take Photo"
4. Optionally record an audio note
5. Tap "Identify Plant" to get AI identification
6. Results are automatically saved to gallery

### Tracking Foraging Sessions
1. Open the Map screen
2. Tap "Start" in the Activity Tracker card
3. Walk around - steps and metrics update in real-time
4. Shake phone to quick-mark interesting locations
5. Tap "Stop" to end session and save data

### Adding Map Markers
- **Long-press** on map to add a marker
- Enter a name and choose an icon
- **Tap marker** to view details or remove

### Connecting Wearables
1. Go to Profile screen
2. Expand "Bluetooth Settings" section
3. Tap "Open Bluetooth Settings"
4. Pair your device in system settings

## 🔧 Configuration

### API Keys (Optional)

Edit `config/apiConfig.ts` to add your API keys:

```typescript
export const API_KEYS = {
  PLANTNET_API_KEY: 'your-key-here', // Optional - has mock fallback
  // Weather API uses Open-Meteo (no key required)
};
```

**PlantNet API:** Get a free key at https://my.plantnet.org/

## 🗂️ Project Structure

```
PME-ForagingCompanion/
├── screens/          # App screens (Home, Map, Plants, Profile, Gallery)
├── services/         # Business logic (Network, Bluetooth, Accelerometer)
├── config/           # API configuration
├── database.ts       # SQLite database functions
├── styles/           # Global styling
└── assets/           # Images and icons
```

## 📊 Database Schema

### Plants Table
- Location (latitude, longitude)
- Photo URI
- Audio note URI (optional)
- Identification result
- Timestamp

### Markers Table
- Location (latitude, longitude)
- Name
- Icon emoji
- ID

### Foraging Sessions Table
- Start/end time
- Steps, distance, calories
- Duration
- Activity data

## 🛠️ Technologies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **SQLite** - Local database
- **React Navigation** - Screen navigation
- **Expo Location** - GPS tracking
- **Expo Camera** - Photo capture
- **Expo Sensors** - Accelerometer data
- **Open-Meteo API** - Weather data (no key required)
- **PlantNet API** - Plant identification

## 📱 Permissions Required

- **Camera** - For plant photography
- **Microphone** - For audio notes
- **Location** - For GPS tracking and weather
- **Media Library** - For profile pictures

## 🎯 Key Features Demonstration

### Network Feature
- Check the green/red indicator at top of Plants screen
- View weather card with current conditions
- See foraging recommendations based on weather
- Try plant identification (works offline with mock data)

### Bluetooth Feature
- Open Profile screen
- Expand "Bluetooth Settings"
- Tap button to access system Bluetooth settings
- View suggested wearable devices

### Accelerometer Feature
- Open Map screen
- Start a session to begin tracking
- Walk around to see step counter increase
- Shake phone to trigger quick-mark dialog
- View real-time activity classification
- Stop session to save data and view summary

## 📝 Notes

- **Safety First:** Plant identification is AI-generated and may not be accurate. Always consult experts before consuming any wild plants.
- **Offline Mode:** Most features work offline. Plant identification requires internet but has mock fallback.
- **Battery Usage:** GPS and accelerometer tracking may impact battery life during active sessions.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Development

**Course:** EH5PME - Mobile Application Development  
**Institution:** Aarhus University  
**Semester:** 5th Semester  

---

**Built with ❤️ for foragers and nature enthusiasts**
