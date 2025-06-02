export interface MasterCode {
  master_id: string;
  master_name: string;
  description: string;
  use_yn: 'Y' | 'N';
  created_at: string;
  updated_at: string;
}

export interface DetailCode {
  detail_id: string;
  master_id: string;
  detail_name: string;
  sort_order: number;
  description: string;
  use_yn: 'Y' | 'N';
  extra_value1?: string;
  extra_value2?: string;
  extra_value3?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMasterCodeDto {
  master_id: string;
  master_name: string;
  description?: string;
  use_yn?: 'Y' | 'N';
}

export interface UpdateMasterCodeDto {
  master_name?: string;
  description?: string;
  use_yn?: 'Y' | 'N';
}

export interface CreateDetailCodeDto {
  detail_id: string;
  master_id: string;
  detail_name: string;
  sort_order?: number;
  description?: string;
  use_yn?: 'Y' | 'N';
  extra_value1?: string;
  extra_value2?: string;
  extra_value3?: string;
}

export interface UpdateDetailCodeDto {
  detail_name?: string;
  sort_order?: number;
  description?: string;
  use_yn?: 'Y' | 'N';
  extra_value1?: string;
  extra_value2?: string;
  extra_value3?: string;
} 