import axios from "axios";
import {
  Developer,
  DeveloperCreateInput,
  DeveloperUpdateInput,
} from "@/types/developer";

const API_BASE_URL = "http://localhost:4000/api";

export const developerApi = {
  getAllDevelopers: async (): Promise<Developer[]> => {
    const response = await axios.get(`${API_BASE_URL}/developers`);
    return response.data;
  },

  getDeveloperById: async (id: string): Promise<Developer> => {
    const response = await axios.get(`${API_BASE_URL}/developers/${id}`);
    return response.data;
  },

  createDeveloper: async (data: DeveloperCreateInput): Promise<Developer> => {
    const response = await axios.post(`${API_BASE_URL}/developers`, data);
    return response.data;
  },

  updateDeveloper: async (data: DeveloperUpdateInput): Promise<Developer> => {
    const response = await axios.put(
      `${API_BASE_URL}/developers/${data.developer_id}`,
      data
    );
    return response.data;
  },

  deleteDeveloper: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/developers/${id}`);
  },
};
