export interface Developer {
  developer_id: string;
  developer_name: string;
  developer_email: string;
  developer_phone?: string;
  developer_addr?: string;
  developer_profile_image?: string;
  developer_start_date?: Date;
  developer_career_start_date?: Date;
  developer_current_position?: string;
  developer_grade?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DeveloperCreateInput {
  developer_name: string;
  developer_email: string;
  developer_phone?: string;
  developer_addr?: string;
  developer_profile_image?: string;
  developer_start_date?: Date;
  developer_career_start_date?: Date;
  developer_current_position?: string;
  developer_grade?: string;
}

export interface DeveloperUpdateInput extends Partial<DeveloperCreateInput> {
  developer_id: string;
} 