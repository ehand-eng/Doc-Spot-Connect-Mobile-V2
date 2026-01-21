import axios from 'axios';
import { Platform } from 'react-native';
import { Dispensary } from '../models/dispensary';

const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5001/api'
  : 'http://localhost:5001/api';

const DispensaryService = {
  getAllDispensaries: async (): Promise<Dispensary[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dispensaries`);
      return response.data.map((dispensary: any) => {
        console.log('Raw dispensary from API:', dispensary);
        return {
          id: dispensary._id,
          name: dispensary.name,
          address: dispensary.address,
          latitude: dispensary.latitude ?? dispensary.location?.latitude,
          longitude: dispensary.longitude ?? dispensary.location?.longitude,
          distance: dispensary.distance || 'Not specified',
          rating: dispensary.rating || 4.5,
          isOpen: dispensary.isOpen !== undefined ? dispensary.isOpen : true,
          phone: dispensary.phone || 'Not specified',
          services: dispensary.services || [],
          image: dispensary.image || '🏥',
          createdAt: new Date(dispensary.createdAt),
          updatedAt: new Date(dispensary.updatedAt)
        };
      });
    } catch (error) {
      console.error('Error fetching dispensaries:', error);
      throw new Error('Failed to fetch dispensaries');
    }
  },

  getDispensaryById: async (id: string): Promise<Dispensary | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dispensaries/${id}`);
      if (!response.data) return null;
      return {
        id: response.data._id,
        name: response.data.name,
        address: response.data.address,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        distance: response.data.distance || 'Not specified',
        rating: response.data.rating || 4.5,
        isOpen: response.data.isOpen !== undefined ? response.data.isOpen : true,
        phone: response.data.phone || 'Not specified',
        services: response.data.services || [],
        image: response.data.image || '🏥',
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error) {
      console.error(`Error fetching dispensary with ID ${id}:`, error);
      throw new Error('Failed to fetch dispensary');
    }
  },

  addDispensary: async (dispensary: Omit<Dispensary, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dispensary> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/dispensaries`, dispensary);
      return {
        id: response.data._id,
        name: response.data.name,
        address: response.data.address,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        distance: response.data.distance || 'Not specified',
        rating: response.data.rating || 4.5,
        isOpen: response.data.isOpen !== undefined ? response.data.isOpen : true,
        phone: response.data.phone || 'Not specified',
        services: response.data.services || [],
        image: response.data.image || '🏥',
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error) {
      console.error('Error adding dispensary:', error);
      throw new Error('Failed to add dispensary');
    }
  },

  updateDispensary: async (id: string, dispensary: Partial<Dispensary>): Promise<Dispensary | null> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/dispensaries/${id}`, dispensary);
      if (!response.data) return null;
      return {
        id: response.data._id,
        name: response.data.name,
        address: response.data.address,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        distance: response.data.distance || 'Not specified',
        rating: response.data.rating || 4.5,
        isOpen: response.data.isOpen !== undefined ? response.data.isOpen : true,
        phone: response.data.phone || 'Not specified',
        services: response.data.services || [],
        image: response.data.image || '🏥',
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error) {
      console.error(`Error updating dispensary with ID ${id}:`, error);
      throw new Error('Failed to update dispensary');
    }
  },

  deleteDispensary: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_BASE_URL}/dispensaries/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting dispensary with ID ${id}:`, error);
      throw new Error('Failed to delete dispensary');
    }
  },
};

export default DispensaryService; 