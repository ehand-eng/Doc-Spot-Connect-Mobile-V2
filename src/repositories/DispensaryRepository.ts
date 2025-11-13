import axios from "axios";
import { Dispensary } from "../models/dispensary";

const API_BASE_URL='http://10.0.2.2:5001/api';

export class DispensaryRepository{
    async fetchAll():Promise<any[]>{
        const response = await axios.get('${API_BASE_URL}/dispensary');
        return response.data;
    }

    async fetchById(id:String):Promise<any>{
        const response = await axios.get('${API_BASE_URL}/dispensary/${id}');
        return response.data;
    }

    async create(dispensary: Partial<Dispensary>): Promise<any> {
        const response = await axios.post(`${API_BASE_URL}/dispensaries`, dispensary);
        return response.data;
    }

    async update(id: string, dispensary: Partial<Dispensary>): Promise<any> {
        const response = await axios.put(`${API_BASE_URL}/dispensaries/${id}`, dispensary);
        return response.data;
  }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_BASE_URL}/dispensaries/${id}`);
  }
}