import axios from "axios";
import {
  Developer,
  DeveloperCreateInput,
  DeveloperUpdateInput,
} from "@/types/developer";

const API_BASE_URL = "http://localhost:4000/api";

export interface DeveloperListResponse {
  developers: Developer[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DeveloperQueryParams {
  page?: number;
  pageSize?: number;
  searchKeyword?: string;
}

export const developerApi = {
  getAllDevelopers: async (params: DeveloperQueryParams = {}): Promise<DeveloperListResponse> => {
    try {
      console.log('Fetching developers with params:', params);
      const response = await axios.get(`${API_BASE_URL}/developers`, {
        params: {
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          searchKeyword: params.searchKeyword || '',
        },
      });
      console.log('Received response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching developers:', error);
      throw error;
    }
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
