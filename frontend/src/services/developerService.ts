import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/developers';

interface DeveloperQueryParams {
  page: number;
  pageSize: number;
  name?: string;
  email?: string;
  phone?: string;
  skills?: string;
  excludeSkills?: string;
  skillsCondition?: string;
  excludeSkillsCondition?: string;
  gender?: string;
  position?: string;
  grade?: string;
}

export interface Developer {
  developer_id: string;
  developer_name: string;
  developer_birth?: string;
  developer_sex?: string;
  developer_email: string;
  developer_phone?: string;
  developer_addr?: string;
  developer_profile_image?: string;
  developer_start_date?: string;
  developer_career_start_date?: string;
  developer_current_position: string;
  developer_grade: string;
  developer_married?: string;
  developer_military_start_date?: string;
  developer_military_end_date?: string;
  developer_military_desc?: string;
  developer_skills?: string;
  created_at?: string;
  updated_at?: string;
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
  developer_skills?: string;
}

export interface DeveloperListResponse {
  developers: Developer[];
  total: number;
}

export const developerService = {
  // 개발자 목록 조회
  async getDevelopers(params: DeveloperQueryParams): Promise<DeveloperListResponse> {
    const queryParams = new URLSearchParams();
    
    // 페이지네이션 파라미터
    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());
    
    // 검색 파라미터
    if (params.name) queryParams.append('name', params.name);
    if (params.email) queryParams.append('email', params.email);
    if (params.phone) queryParams.append('phone', params.phone);
    if (params.skills) queryParams.append('skills', params.skills);
    if (params.excludeSkills) queryParams.append('excludeSkills', params.excludeSkills);
    if (params.skillsCondition) queryParams.append('skillsCondition', params.skillsCondition);
    if (params.excludeSkillsCondition) queryParams.append('excludeSkillsCondition', params.excludeSkillsCondition);
    if (params.gender) queryParams.append('gender', params.gender);
    if (params.position) queryParams.append('position', params.position);
    if (params.grade) queryParams.append('grade', params.grade);

    const response = await axios.get(`${API_BASE_URL}?${queryParams}`);
    return response.data;
  },

  // 개발자 상세 정보 조회
  async getDeveloperById(id: string): Promise<Developer> {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // 개발자 등록
  async createDeveloper(developer: CreateDeveloperDto): Promise<Developer> {
    console.log('Creating developer with data:', developer);
    try {
      const response = await axios.post(API_BASE_URL, developer);
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
  async deleteDevelopers(ids: string[]): Promise<void> {
    console.log('Deleting developers:', ids);
    const response = await axios.delete(API_BASE_URL, {
      data: { ids }
    });
    return response.data;
  },
}; 