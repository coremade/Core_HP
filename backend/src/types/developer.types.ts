export interface Developer {
  developer_id: string;
  developer_name: string;
  developer_birth: number;
  developer_sex: 'M' | 'F';
  developer_email: string;
  developer_phone?: string;
  developer_addr: string;
  developer_profile_image?: string;
  developer_start_date: string;
  developer_career_start_date?: string;
  developer_current_position: string;
  developer_grade: string;
  developer_married?: 'Y' | 'N';
  developer_military_start_date?: string;
  developer_military_end_date?: string;
  developer_military_desc?: string;
  developer_evaluation_code?: string;
  created_at?: string;
  updated_at?: string;
} 