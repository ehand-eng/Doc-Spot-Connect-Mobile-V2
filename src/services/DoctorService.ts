import axios from 'axios';
import { Platform } from 'react-native';
import { Doctor } from '../models/doctor';

const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5001/api'
  : 'http://localhost:5001/api';

export const DoctorService = {
  // Get all doctors
  getAllDoctors: async (): Promise<Doctor[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors`);
      return response.data.map((doctor: any) => ({
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        email: doctor.email,
        experience: doctor.experience || 'Not specified',
        rating: doctor.rating || 4.5,
        availableSlots: doctor.availableSlots || [],
        image: doctor.image || '👨‍⚕️',
        createdAt: new Date(doctor.createdAt),
        updatedAt: new Date(doctor.updatedAt)
      }));
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw new Error('Failed to fetch doctors');
    }
  },

  // Get doctor by ID
  getDoctorById: async (id: string): Promise<Doctor | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors/${id}`);
      if (!response.data) return null;

      return {
        id: response.data._id,
        name: response.data.name,
        specialization: response.data.specialization,
        email: response.data.email,
        experience: response.data.experience || 'Not specified',
        rating: response.data.rating || 4.5,
        availableSlots: response.data.availableSlots || [],
        image: response.data.image || '👨‍⚕️',
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error) {
      console.error(`Error fetching doctor with ID ${id}:`, error);
      throw new Error('Failed to fetch doctor');
    }
  },

  // Add a new doctor
  addDoctor: async (doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/doctors`, doctor);
      return {
        id: response.data._id,
        name: response.data.name,
        specialization: response.data.specialization,
        email: response.data.email,
        experience: response.data.experience || 'Not specified',
        rating: response.data.rating || 4.5,
        availableSlots: response.data.availableSlots || [],
        image: response.data.image || '👨‍⚕️',
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error) {
      console.error('Error adding doctor:', error);
      throw new Error('Failed to add doctor');
    }
  },

  // Update doctor
  updateDoctor: async (id: string, doctor: Partial<Doctor>): Promise<Doctor | null> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/doctors/${id}`, doctor);
      if (!response.data) return null;

      return {
        id: response.data._id,
        name: response.data.name,
        specialization: response.data.specialization,
        email: response.data.email,
        experience: response.data.experience || 'Not specified',
        rating: response.data.rating || 4.5,
        availableSlots: response.data.availableSlots || [],
        image: response.data.image || '👨‍⚕️',
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error) {
      console.error(`Error updating doctor with ID ${id}:`, error);
      throw new Error('Failed to update doctor');
    }
  },

  // Delete doctor
  deleteDoctor: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_BASE_URL}/doctors/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting doctor with ID ${id}:`, error);
      throw new Error('Failed to delete doctor');
    }
  }
}; 