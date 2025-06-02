import axios from 'axios';
import {
  MasterCode,
  DetailCode,
  CreateMasterCodeDto,
  UpdateMasterCodeDto,
  CreateDetailCodeDto,
  UpdateDetailCodeDto,
} from '../types/commonCode';

const API_BASE_URL = 'http://localhost:4000/api';

export const commonCodeApi = {
  // 마스터 코드 API
  getAllMasterCodes: async (): Promise<MasterCode[]> => {
    const response = await axios.get(`${API_BASE_URL}/common-codes/master`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  },

  getMasterCodeById: async (id: string): Promise<MasterCode> => {
    const response = await axios.get(`${API_BASE_URL}/common-codes/master/${id}`);
    return response.data;
  },

  createMasterCode: async (data: CreateMasterCodeDto): Promise<MasterCode> => {
    const response = await axios.post(`${API_BASE_URL}/common-codes/master`, data);
    return response.data;
  },

  updateMasterCode: async (id: string, data: UpdateMasterCodeDto): Promise<MasterCode> => {
    const response = await axios.put(`${API_BASE_URL}/common-codes/master/${id}`, data);
    return response.data;
  },

  deleteMasterCode: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/common-codes/master/${id}`);
  },

  // 상세 코드 API
  getDetailCodesByMasterId: async (masterId: string): Promise<DetailCode[]> => {
    console.log('🔵 API 요청 - 세부코드 조회:', {
      method: 'GET',
      url: `${API_BASE_URL}/common-codes/detail/${masterId}`,
      masterId
    });
    
    const response = await axios.get(`${API_BASE_URL}/common-codes/detail/${masterId}`);
    
    console.log('🟢 API 응답 - 세부코드 조회:', {
      status: response.status,
      data: response.data,
      count: response.data.length
    });
    
    return response.data;
  },

  createDetailCode: async (data: CreateDetailCodeDto): Promise<DetailCode> => {
    const response = await axios.post(`${API_BASE_URL}/common-codes/detail`, data);
    return response.data;
  },

  updateDetailCode: async (id: string, data: UpdateDetailCodeDto): Promise<DetailCode> => {
    const response = await axios.put(`${API_BASE_URL}/common-codes/detail/${id}`, data);
    return response.data;
  },

  deleteDetailCode: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/common-codes/detail/${id}`);
  },
}; 