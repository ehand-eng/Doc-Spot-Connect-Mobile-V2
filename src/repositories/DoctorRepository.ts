import axios from "axios";
import { Doctor } from "../models/doctor";


const API_BASE_URL = 'http://10.0.2.2:5001/api/doctors';

export class DoctorRepository{
    async fetchAll():Promise<Doctor[]>{
        const response = await axios.get(API_BASE_URL);
        return response.data;
    }

    async fetchIdBy(id:String):Promise<Doctor>{
        const response=await axios.get('${API_BASE_URL}/${id}');
        return response.data;
    }
      async create(doctor: Partial<Doctor>): Promise<Doctor> {
    const response = await axios.post(API_BASE_URL, doctor);
    return response.data;
  }

  async update(id: string, doctor: Partial<Doctor>): Promise<Doctor> {
    const response = await axios.put(`${API_BASE_URL}/${id}`, doctor);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/${id}`);
  }
}