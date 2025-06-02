import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/developers';

export interface Developer {
  developer_id: string;
  developer_name: string;
  developer_birth: string;
  developer_sex: string;
  developer_email: string;
  developer_phone?: string;
  developer_addr: string;
  developer_profile_image?: string;
  developer_start_date?: string;
  developer_career_start_date?: string;
  developer_current_position: string;
  developer_grade: string;
  developer_married?: string;
  developer_military_start_date?: string;
  developer_military_end_date?: string;
  developer_military_desc?: string;
  developer_evaluation_code?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDeveloperDto {
  developer_name: string;
  developer_birth: string;
  developer_sex: string;
  developer_email: string;
  developer_phone?: string;
  developer_addr: string;
  developer_profile_image?: string;
  developer_start_date?: string;
  developer_career_start_date?: string;
  developer_current_position: string;
  developer_grade: string;
  developer_married?: string;
  developer_military_start_date?: string;
  developer_military_end_date?: string;
  developer_military_desc?: string;
}

export interface DeveloperListResponse {
  developers: Developer[];
  total: number;
}

export interface DeveloperQueryParams {
  page: number;
  pageSize: number;
  searchKeyword?: string;
}

export const developerService = {
  // 개발자 목록 조회
  async getDevelopers({ page, pageSize, searchKeyword }: DeveloperQueryParams): Promise<DeveloperListResponse> {
    const response = await axios.get(API_BASE_URL, {
      params: {
        page,
        pageSize,
        searchKeyword,
      },
    });
    return response.data;
  },

  // 개발자 상세 정보 조회
  async getDeveloperById(id: string): Promise<Developer> {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // 개발자 등록
  async createDeveloper(data: CreateDeveloperDto): Promise<Developer> {
    console.log('Creating developer with data:', data);
    try {
      const response = await axios.post(API_BASE_URL, data);
      return response.data;
    } catch (error: any) {
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // 개발자 수정
  async updateDeveloper(id: string, data: Partial<Developer>): Promise<Developer> {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
  },

  // 개발자 삭제 (단일 또는 여러명)
  async deleteDevelopers(ids: string | string[]): Promise<void> {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    console.log('Deleting developers:', idsArray);
    await axios.delete(`${API_BASE_URL}`, {
      data: { ids: idsArray }
    });
  },
}; 