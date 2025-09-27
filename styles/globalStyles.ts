import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '90%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  primaryColor: '#4CAF50',
  camera: {
    flex: 1,
    margin: 20,
  },
  image: {
    width: 100,
    height: 100,
    margin: 10,
  },
  identification: {
    fontSize: 16,
    margin: 10,
    color: 'green',
  },
});
