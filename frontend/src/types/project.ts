import { Developer } from './developer';

export interface Project {
  project_id: string;
  project_name: string;
  project_status: string;
  project_start_date: string;
  project_end_date: string;
  project_description: string;
  project_client_id: string;
  project_practitioner_id: string;
  project_pm_name: string;
  project_skill_model: string;
  project_skill_os: string;
  project_skill_language: string;
  project_skill_dbms: string;
  project_skill_tool: string;
  project_skill_protocol: string;
  project_skill_etc: string;
  developer_count?: number;
  developers?: ProjectDeveloper[];
}

export interface ProjectFormData {
  project_name: string;
  project_start_date: string;
  project_end_date: string;
  project_description: string;
  project_client_id: string;
  project_practitioner_id: string;
  project_pm_name: string;
  project_status: string;
  project_skill_model: string;
  project_skill_os: string;
  project_skill_language: string;
  project_skill_dbms: string;
  project_skill_tool: string;
  project_skill_protocol: string;
  project_skill_etc: string;
}

export interface ProjectDeveloper {
  developer_id: string;
  developer_name: string;
  developer_phone: string;
  developer_email: string;
  developer_grade: string;
  task?: string;
  start_date?: string;
  end_date?: string;
  project_skill_language?: string;
  project_skill_dbms?: string;
  project_skill_tool?: string;
  isMarkedForDeletion?: boolean;
}

export interface SearchParams {
  project_name?: string;
  project_start_date?: string;
  project_end_date?: string;
  project_status?: string;
  page?: number;
  limit?: number;
  developer_name?: string;
  task?: string;
  project_skill_language?: string;
  project_skill_dbms?: string;
  project_skill_tool?: string;
  project_skill_protocol?: string;
  project_skill_etc?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
} 