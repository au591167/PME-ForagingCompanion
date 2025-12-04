// Accelerometer Service - Handles motion detection and activity tracking
import { Accelerometer } from 'expo-sensors';
import { Subscription } from 'expo-sensors/build/Pedometer';

// Activity Types
export enum ActivityType {
  STANDING = 'Standing',
  WALKING = 'Walking',
  RUNNING = 'Running',
  SITTING = 'Sitting',
}

// Activity Data Interface
export interface ActivityData {
  steps: number;
  distance: number; // in meters
  calories: number;
  duration: number; // in seconds
  activityType: ActivityType;
  startTime: number;
}

// Accelerometer Data
export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

// Shake Detection
let lastShakeTime = 0;
const SHAKE_THRESHOLD = 2.5; // Acceleration threshold for shake detection
const SHAKE_TIMEOUT = 1000; // Minimum time between shakes (ms)

// Activity Detection
let accelerometerHistory: AccelerometerData[] = [];
const HISTORY_SIZE = 20; // Keep last 20 readings for activity detection
const STEP_THRESHOLD = 1.2; // Threshold for step detection
let stepCount = 0;
let lastStepTime = 0;
const STEP_TIMEOUT = 300; // Minimum time between steps (ms)

// Session tracking
let sessionStartTime: number | null = null;
let sessionSteps = 0;

// Subscribe to accelerometer updates
export const subscribeToAccelerometer = (
  onShake: () => void,
  onStep: (steps: number) => void,
  onActivityChange: (activity: ActivityType) => void,
  updateInterval: number = 100 // Update every 100ms
): Subscription => {
  Accelerometer.setUpdateInterval(updateInterval);

  return Accelerometer.addListener((data) => {
    const { x, y, z } = data;
    const timestamp = Date.now();

    // Calculate total acceleration
    const acceleration = Math.sqrt(x * x + y * y + z * z);

    // Store in history for activity detection
    accelerometerHistory.push({ x, y, z, timestamp });
    if (accelerometerHistory.length > HISTORY_SIZE) {
      accelerometerHistory.shift();
    }

    // Shake Detection
    if (acceleration > SHAKE_THRESHOLD) {
      const now = Date.now();
      if (now - lastShakeTime > SHAKE_TIMEOUT) {
        lastShakeTime = now;
        onShake();
      }
    }

    // Step Detection
    if (acceleration > STEP_THRESHOLD) {
      const now = Date.now();
      if (now - lastStepTime > STEP_TIMEOUT) {
        lastStepTime = now;
        stepCount++;
        sessionSteps++;
        onStep(stepCount);
      }
    }

    // Activity Detection (every 2 seconds)
    if (accelerometerHistory.length >= HISTORY_SIZE) {
      const activity = detectActivity(accelerometerHistory);
      onActivityChange(activity);
    }
  });
};

// Detect current activity based on accelerometer history
const detectActivity = (history: AccelerometerData[]): ActivityType => {
  if (history.length < 5) return ActivityType.STANDING;

  // Calculate variance in acceleration
  const accelerations = history.map(d => Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z));
  const mean = accelerations.reduce((a, b) => a + b, 0) / accelerations.length;
  const variance = accelerations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / accelerations.length;

  // Classify activity based on variance
  if (variance < 0.01) {
    return ActivityType.SITTING;
  } else if (variance < 0.1) {
    return ActivityType.STANDING;
  } else if (variance < 0.5) {
    return ActivityType.WALKING;
  } else {
    return ActivityType.RUNNING;
  }
};

// Start a foraging session
export const startForagingSession = (): void => {
  sessionStartTime = Date.now();
  sessionSteps = 0;
  stepCount = 0;
};

// Stop foraging session and return data
export const stopForagingSession = (): ActivityData | null => {
  if (!sessionStartTime) return null;

  const duration = Math.floor((Date.now() - sessionStartTime) / 1000); // seconds
  const distance = calculateDistance(sessionSteps);
  const calories = calculateCalories(sessionSteps, duration);

  const data: ActivityData = {
    steps: sessionSteps,
    distance,
    calories,
    duration,
    activityType: ActivityType.WALKING, // Default to walking
    startTime: sessionStartTime,
  };

  // Reset session
  sessionStartTime = null;
  sessionSteps = 0;

  return data;
};

// Get current session data
export const getCurrentSessionData = (): ActivityData | null => {
  if (!sessionStartTime) return null;

  const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
  const distance = calculateDistance(sessionSteps);
  const calories = calculateCalories(sessionSteps, duration);

  return {
    steps: sessionSteps,
    distance,
    calories,
    duration,
    activityType: ActivityType.WALKING,
    startTime: sessionStartTime,
  };
};

// Calculate distance from steps (average step length: 0.762 meters)
const calculateDistance = (steps: number): number => {
  const AVERAGE_STEP_LENGTH = 0.762; // meters
  return Math.round(steps * AVERAGE_STEP_LENGTH);
};

// Calculate calories burned (rough estimate)
const calculateCalories = (steps: number, durationSeconds: number): number => {
  // Rough estimate: 0.04 calories per step
  const CALORIES_PER_STEP = 0.04;
  return Math.round(steps * CALORIES_PER_STEP);
};

// Reset step counter
export const resetStepCounter = (): void => {
  stepCount = 0;
  sessionSteps = 0;
};

// Get current step count
export const getStepCount = (): number => {
  return stepCount;
};

// Check if session is active
export const isSessionActive = (): boolean => {
  return sessionStartTime !== null;
};

// Format duration for display
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

// Format distance for display
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${meters} m`;
};
