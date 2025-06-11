import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface ApiSkillInfo {
  project_start_ym: string;
  project_end_ym: string | null;
  project_name: string;
  project_practitioner_id: string | null;
  project_client_id: string | null;
  task: string;
  project_skill_model: string | null;
  project_skill_os: string | null;
  project_skill_language: string | null;
  project_skill_dbms: string | null;
  project_skill_tool: string | null;
  project_skill_protocol: string | null;
  project_skill_etc: string | null;
  developer_id: string;
}

interface FormData {
  project_start_ym: string;
  project_end_ym: string | null;
  project_name: string;
  project_practitioner_id: string | null;
  project_client_id: string | null;
  task: string;
  project_skill_model: string | null;
  project_skill_os: string | null;
  project_skill_language: string | null;
  project_skill_dbms: string | null;
  project_skill_tool: string | null;
  project_skill_protocol: string | null;
  project_skill_etc: string | null;
}

interface ApiResponse {
  skills: ApiSkillInfo[];
  total: number;
}

interface DeveloperSkillInfoProps {
  developerId: string;
}

interface FormErrors {
  project_start_ym?: string;
  project_end_ym?: string;
  project_name?: string;
  task?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

const formatYearMonth = (ym: string) => {
  if (!ym || ym.length !== 6) return ym;
  return `${ym.slice(0, 4)}-${ym.slice(4)}`;
};

const truncateText = (text: string | null | undefined, maxLength: number = 10) => {
  if (!text) return '-';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const pageSizeOptions = [10, 25, 50, 100];

export default function DeveloperSkillInfo({ developerId }: DeveloperSkillInfoProps) {
  const [skills, setSkills] = useState<ApiSkillInfo[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApiSkillInfo | null>(null);
  const [formData, setFormData] = useState<FormData>({
    project_start_ym: '',
    project_end_ym: null,
    project_name: '',
    project_practitioner_id: null,
    project_client_id: null,
    task: '',
    project_skill_model: null,
    project_skill_os: null,
    project_skill_language: null,
    project_skill_dbms: null,
    project_skill_tool: null,
    project_skill_protocol: null,
    project_skill_etc: null
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const handleChange = useCallback((field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  }, []);

  const loadSkills = useCallback(async () => {
    if (!developerId) return;

    try {
      const response = await axios.get<ApiResponse>(`${API_BASE_URL}/developers/${developerId}/skills`);
      const formattedSkills: ApiSkillInfo[] = (response.data.skills || []).map((skill: ApiSkillInfo) => ({
        ...skill,
        project_start_ym: skill.project_start_ym.replace(/(\d{4})(\d{2})/, '$1-$2'),
        project_end_ym: skill.project_end_ym ? skill.project_end_ym.replace(/(\d{4})(\d{2})/, '$1-$2') : null
      }));
      setSkills(formattedSkills);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('기술 이력 조회 중 오류:', error);
      setSkills([]);
      setTotal(0);
    }
  }, [developerId]);

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};
    
    if (!formData.project_start_ym) {
      newErrors.project_start_ym = '시작년월을 입력해주세요';
    } else if (!/^\d{4}-\d{2}$/.test(formData.project_start_ym)) {
      newErrors.project_start_ym = 'YYYY-MM 형식으로 입력해주세요';
    }

    if (formData.project_end_ym && !/^\d{4}-\d{2}$/.test(formData.project_end_ym)) {
      newErrors.project_end_ym = 'YYYY-MM 형식으로 입력해주세요';
    }

    if (!formData.project_name) {
      newErrors.project_name = '프로젝트명을 입력해주세요';
    }

    if (!formData.task) {
      newErrors.task = '업무를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSelectAll = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedItems(skills.map(skill => skill.project_start_ym));
    } else {
      setSelectedItems([]);
    }
  }, [skills]);

  const handleCheckboxChange = useCallback((id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const handleEdit = useCallback((item: ApiSkillInfo) => {
    setEditingItem(item);
    setFormData(item);
    setErrors({});
    setIsDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!developerId) return;

    if (!validateForm()) {
      return;
    }

    try {
      const endpoint = `${API_BASE_URL}/developers/${developerId}/skills`;
      const data: ApiSkillInfo = {
        project_start_ym: formData.project_start_ym.replace(/-/g, ''),
        project_end_ym: formData.project_end_ym ? formData.project_end_ym.replace(/-/g, '') : null,
        project_name: formData.project_name,
        project_practitioner_id: formData.project_practitioner_id,
        project_client_id: formData.project_client_id,
        task: formData.task,
        project_skill_model: formData.project_skill_model,
        project_skill_os: formData.project_skill_os,
        project_skill_language: formData.project_skill_language,
        project_skill_dbms: formData.project_skill_dbms,
        project_skill_tool: formData.project_skill_tool,
        project_skill_protocol: formData.project_skill_protocol,
        project_skill_etc: formData.project_skill_etc,
        developer_id: developerId
      };

      // 전송되는 데이터 로깅
      console.log('기술 이력 데이터 전송:', data);

      if (editingItem) {
        // 수정 시에는 project_start_ym을 URL 파라미터로 사용 (하이픈 제거)
        const urlParam = editingItem.project_start_ym.replace(/-/g, '');
        const response = await axios.put(`${endpoint}/${urlParam}`, data);
        console.log('수정 응답:', response.data);
      } else {
        const response = await axios.post(endpoint, data);
        console.log('저장 응답:', response.data);
      }

      setIsDialogOpen(false);
      setFormData({
        project_start_ym: '',
        project_end_ym: null,
        project_name: '',
        project_practitioner_id: null,
        project_client_id: null,
        task: '',
        project_skill_model: null,
        project_skill_os: null,
        project_skill_language: null,
        project_skill_dbms: null,
        project_skill_tool: null,
        project_skill_protocol: null,
        project_skill_etc: null
      });
      setEditingItem(null);
      setErrors({});
      loadSkills();
    } catch (error) {
      console.error('데이터 저장 중 오류:', error);
      // API 에러 응답 로깅
      if (axios.isAxiosError(error) && error.response) {
        console.error('API 에러 응답:', error.response.data);
      }
    }
  }, [developerId, formData, editingItem, validateForm, loadSkills]);

  const TableHeader = useMemo(() => (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            checked={skills.length > 0 && selectedItems.length === skills.length}
            indeterminate={selectedItems.length > 0 && selectedItems.length < skills.length}
            onChange={handleSelectAll}
          />
        </TableCell>
        <TableCell>시작년월</TableCell>
        <TableCell>종료년월</TableCell>
        <TableCell>프로젝트명</TableCell>
        <TableCell>업무</TableCell>
        <TableCell>작업</TableCell>
      </TableRow>
    </TableHead>
  ), [selectedItems.length, skills.length, handleSelectAll]);

  const TableContent = useMemo(() => (
    <TableBody>
      {skills.map((skill) => (
        <TableRow key={`${skill.developer_id}-${skill.project_start_ym}`}>
          <TableCell padding="checkbox">
            <Checkbox
              checked={selectedItems.includes(skill.project_start_ym)}
              onChange={() => handleCheckboxChange(skill.project_start_ym)}
            />
          </TableCell>
          <TableCell>{formatYearMonth(skill.project_start_ym)}</TableCell>
          <TableCell>{skill.project_end_ym ? formatYearMonth(skill.project_end_ym) : '진행중'}</TableCell>
          <TableCell>{skill.project_name}</TableCell>
          <TableCell title={skill.task || ''}>{truncateText(skill.task)}</TableCell>
          <TableCell>
            <Box>
              <Button
                
                onClick={() => handleEdit(skill)}
              >
                수정
              </Button>
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  ), [skills, selectedItems, handleCheckboxChange, handleEdit]);

  const EditDialog = useMemo(() => (
    <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>{editingItem ? '기술 이력 수정' : '기술 이력 추가'}</DialogTitle>
      <DialogContent sx={{ px: 2 }}>
        <Box sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField
            label="시작년월 (YYYY-MM)"
            value={formData?.project_start_ym || ''}
            onChange={handleChange('project_start_ym')}
            required
            error={!!errors.project_start_ym}
            helperText={errors.project_start_ym}
            disabled={!!editingItem}
          />
          <TextField
            label="종료년월 (YYYY-MM)"
            value={formData?.project_end_ym || ''}
            onChange={handleChange('project_end_ym')}
            helperText="진행중인 경우 비워두세요"
            error={!!errors.project_end_ym}
          />
          <TextField
            label="프로젝트명"
            value={formData?.project_name || ''}
            onChange={handleChange('project_name')}
            required
            error={!!errors.project_name}
            helperText={errors.project_name}
          />
          <TextField
            label="업무"
            value={formData?.task || ''}
            onChange={handleChange('task')}
            required
            multiline
            rows={3}
            error={!!errors.task}
            helperText={errors.task}
          />
          <TextField
            label="발주처"
            value={formData?.project_client_id || ''}
            onChange={handleChange('project_client_id')}
          />
          <TextField
            label="수행사"
            value={formData?.project_practitioner_id || ''}
            onChange={handleChange('project_practitioner_id')}
          />
          <TextField
            label="개발 모델"
            value={formData?.project_skill_model || ''}
            onChange={handleChange('project_skill_model')}
          />
          <TextField
            label="운영체제"
            value={formData?.project_skill_os || ''}
            onChange={handleChange('project_skill_os')}
          />
          <TextField
            label="개발 언어"
            value={formData?.project_skill_language || ''}
            onChange={handleChange('project_skill_language')}
          />
          <TextField
            label="DBMS"
            value={formData?.project_skill_dbms || ''}
            onChange={handleChange('project_skill_dbms')}
          />
          <TextField
            label="개발 도구"
            value={formData?.project_skill_tool || ''}
            onChange={handleChange('project_skill_tool')}
          />
          <TextField
            label="프로토콜"
            value={formData?.project_skill_protocol || ''}
            onChange={handleChange('project_skill_protocol')}
          />
          <TextField
            label="기타"
            value={formData?.project_skill_etc || ''}
            onChange={handleChange('project_skill_etc')}
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        px: 2, 
        justifyContent: 'flex-end',
        paddingRight: '32px'
      }}>
        <Button onClick={() => setIsDialogOpen(false)}>취소</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  ), [isDialogOpen, editingItem, formData, errors, handleChange, handleSubmit]);

  useEffect(() => {
    if (developerId) {
      loadSkills();
    }
  }, [developerId, page, limit]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    setLimit(event.target.value as number);
    setPage(1);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      project_start_ym: '',
      project_end_ym: null,
      project_name: '',
      project_practitioner_id: null,
      project_client_id: null,
      task: '',
      project_skill_model: null,
      project_skill_os: null,
      project_skill_language: null,
      project_skill_dbms: null,
      project_skill_tool: null,
      project_skill_protocol: null,
      project_skill_etc: null
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleDeleteSelected = async () => {
    if (!developerId || selectedItems.length === 0) return;

    try {
      await axios.delete(`${API_BASE_URL}/developers/${developerId}/skills`, {
        data: { ids: selectedItems }
      });
      setSelectedItems([]);
      loadSkills();
    } catch (error) {
      console.error('데이터 삭제 중 오류:', error);
    }
  };

  const SkillInfoContent = (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          기술 이력 추가
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteSelected}
          startIcon={<DeleteIcon />}
          disabled={selectedItems.length === 0}
        >
          선택 삭제
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          {TableHeader}
          {TableContent}
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          count={Math.ceil(total / limit)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {EditDialog}
    </Box>
  );

  return SkillInfoContent;
}

// 기술 이력 상세 정보 팝업 컴포넌트
interface DeveloperSkillDetailDialogProps {
  open: boolean;
  onClose: () => void;
  developerId: string;
  projectStartYm: string;
  title?: string;
  readonly?: boolean;
}

export function DeveloperSkillDetailDialog({ 
  open, 
  onClose, 
  developerId, 
  projectStartYm, 
  title = "기술 이력", 
  readonly = true 
}: DeveloperSkillDetailDialogProps) {
  const [skillDetail, setSkillDetail] = useState<ApiSkillInfo | null>(null);

  const loadSkillDetail = useCallback(async () => {
    if (!developerId || !projectStartYm) return;

    try {
      const response = await axios.get<ApiResponse>(`${API_BASE_URL}/developers/${developerId}/skills`);
      const skill = response.data.skills?.find(s => s.project_start_ym.replace(/(\d{4})(\d{2})/, '$1-$2') === projectStartYm);
      if (skill) {
        setSkillDetail({
          ...skill,
          project_start_ym: skill.project_start_ym.replace(/(\d{4})(\d{2})/, '$1-$2'),
          project_end_ym: skill.project_end_ym ? skill.project_end_ym.replace(/(\d{4})(\d{2})/, '$1-$2') : null
        });
      }
    } catch (error) {
      console.error('기술 이력 상세 조회 중 오류:', error);
    }
  }, [developerId, projectStartYm]);

  useEffect(() => {
    if (open) {
      loadSkillDetail();
    }
  }, [open, loadSkillDetail]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ px: 2 }}>
        <Box sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField
            label="시작년월"
            value={skillDetail?.project_start_ym || ''}
            InputProps={{ readOnly: readonly }}
            variant={readonly ? "standard" : "outlined"}
          />
          <TextField
            label="종료년월"
            value={skillDetail?.project_end_ym || '진행중'}
            InputProps={{ readOnly: readonly }}
            variant={readonly ? "standard" : "outlined"}
          />
          <TextField
            label="프로젝트명"
            value={skillDetail?.project_name || ''}
            InputProps={{ readOnly: readonly }}
            variant={readonly ? "standard" : "outlined"}
          />
          <TextField
            label="업무"
            value={skillDetail?.task || ''}
            InputProps={{ readOnly: readonly }}
            variant={readonly ? "standard" : "outlined"}
            multiline
            rows={3}
          />
          <TextField
            label="발주처"
            value={skillDetail?.project_client_id || ''}
            InputProps={{ readOnly: readonly }}
            variant={readonly ? "standard" : "outlined"}
          />
          <TextField
            label="수행사"
            value={skillDetail?.project_practitioner_id || ''}
            InputProps={{ readOnly: readonly }}
            variant={readonly ? "standard" : "outlined"}
          />
          <TextField
            label="개발 모델"
            value={skillDetail?.project_skill_model || ''}
            InputProps={{ readOnly: readonly }}
            variant={readonly ? "standard" : "outlined"}
          />
          <TextField
            label="운영체제"
            value={skillDetail?.project_skill_os || ''}
            InputProps={{ readOnly: readonly }}
            variant={readonly ? "standard" : "outlined"}
          />
          <TextField
            label="개발 언어"
            value={skillDetail?.project_skill_language || ''}
            InputProps={{ readOnly: readonly }}
            variant={readonly ? "standard" : "outlined"}
          />
          <TextField
            label="DBMS"
            value={skillDetail?.project_skill_dbms || ''}
            InputProps={{ readOnly: readonly }}
            variant={readonly ? "standard" : "outlined"}
          />
          <TextField
            label="개발 도구"
            value={skillDetail?.project_skill_tool || ''}
            InputProps={{ readOnly: readonly }}
            variant={readonly ? "standard" : "outlined"}
          />
          <TextField
            label="프로토콜"
            value={skillDetail?.project_skill_protocol || ''}
            InputProps={{ readOnly: readonly }}
            variant={readonly ? "standard" : "outlined"}
          />
          <TextField
            label="기타"
            value={skillDetail?.project_skill_etc || ''}
            InputProps={{ readOnly: readonly }}
            variant={readonly ? "standard" : "outlined"}
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
} 