import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('foraging.db');

export interface PlantEntry {
  id?: number;
  latitude: number;
  longitude: number;
  photoUri: string;
  soundUri?: string;
  identification: string;
  timestamp: number;
}

export interface Marker {
  id?: number;
  latitude: number;
  longitude: number;
  name: string;
  icon: string;
}

export interface ForagingSession {
  id?: number;
  startTime: number;
  endTime: number;
  steps: number;
  distance: number;
  calories: number;
  duration: number;
}

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS plants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      photoUri TEXT NOT NULL,
      soundUri TEXT,
      identification TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);
  db.execSync(`
    CREATE TABLE IF NOT EXISTS markers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL
    );
  `);
  db.execSync(`
    CREATE TABLE IF NOT EXISTS foraging_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startTime INTEGER NOT NULL,
      endTime INTEGER NOT NULL,
      steps INTEGER NOT NULL,
      distance REAL NOT NULL,
      calories REAL NOT NULL,
      duration INTEGER NOT NULL
    );
  `);
};

export const savePlantEntry = (entry: Omit<PlantEntry, 'id'>) => {
  const result = db.runSync(
    'INSERT INTO plants (latitude, longitude, photoUri, soundUri, identification, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [entry.latitude, entry.longitude, entry.photoUri, entry.soundUri || null, entry.identification, entry.timestamp]
  );
  return result.lastInsertRowId;
};

export const getAllPlantEntries = (): PlantEntry[] => {
  const result = db.getAllSync('SELECT * FROM plants ORDER BY timestamp DESC');
  return result as PlantEntry[];
};

export const deletePlantEntry = (id: number) => {
  db.runSync('DELETE FROM plants WHERE id = ?', [id]);
};

export const saveMarker = (marker: Omit<Marker, 'id'>) => {
  const result = db.runSync(
    'INSERT INTO markers (latitude, longitude, name, icon) VALUES (?, ?, ?, ?)',
    [marker.latitude, marker.longitude, marker.name, marker.icon]
  );
  return result.lastInsertRowId;
};

export const getAllMarkers = (): Marker[] => {
  const result = db.getAllSync('SELECT * FROM markers');
  return result as Marker[];
};

export const deleteMarker = (id: number) => {
  db.runSync('DELETE FROM markers WHERE id = ?', [id]);
};

export const saveForagingSession = (session: Omit<ForagingSession, 'id'>) => {
  const result = db.runSync(
    'INSERT INTO foraging_sessions (startTime, endTime, steps, distance, calories, duration) VALUES (?, ?, ?, ?, ?, ?)',
    [session.startTime, session.endTime, session.steps, session.distance, session.calories, session.duration]
  );
  return result.lastInsertRowId;
};

export const getAllForagingSessions = (): ForagingSession[] => {
  const result = db.getAllSync('SELECT * FROM foraging_sessions ORDER BY startTime DESC');
  return result as ForagingSession[];
};

export const deleteForagingSession = (id: number) => {
  db.runSync('DELETE FROM foraging_sessions WHERE id = ?', [id]);
};
