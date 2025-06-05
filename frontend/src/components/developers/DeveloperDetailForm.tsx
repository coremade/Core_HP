import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Developer } from '../../services/developerService';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ko } from 'date-fns/locale';
import axios from 'axios';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import DeveloperSkillInfo from './DeveloperSkillInfo';
import DeveloperSchoolInfo from './DeveloperSchoolInfo';
import DeveloperWorkInfo from './DeveloperWorkInfo';
import DeveloperCertificationInfo from './DeveloperCertificationInfo';

interface DeveloperDetailFormProps {
  developer: Developer | null;
  isCreating?: boolean;
  onSave: (developer: Partial<Developer>) => void;
  onCancel?: () => void;
}

interface ValidationErrors {
  developer_name?: string;
  developer_birth?: string;
  developer_sex?: string;
  developer_email?: string;
  developer_addr?: string;
  developer_phone?: string;
  developer_start_date?: string;
  developer_current_position?: string;
  developer_grade?: string;
}

interface DeveloperSkill {
  developer_id: string;
  project_start_ym: string;
  project_name?: string;
  project_practitioner_id?: string;
  project_client_id?: string;
  role?: string;
  project_end_ym?: string;
  project_skill_model?: string;
  project_skill_os?: string;
  project_skill_language?: string;
  project_skill_dbms?: string;
  project_skill_tool?: string;
  project_skill_protocol?: string;
  project_skill_etc?: string;
  project_month?: number;
  project_id?: string;
}

interface SchoolInfo {
  developer_id: string;
  school_graduation_ym: string;
  school_name: string;
}

interface WorkInfo {
  developer_id: string;
  work_start_ym: string;
  work_end_ym: string;
  work_name: string;
  work_position: string;
  work_task: string;
}

interface CertificationInfo {
  developer_id: string;
  certification_date: string;
  certification_name: string;
  certification_agency: string;
}

// 탭 순서를 관리하는 enum 추가
enum TabType {
  BASIC_INFO = 0,
  EDUCATION = 1,
  CERTIFICATION = 2,
  WORK_HISTORY = 3,
  SKILL_HISTORY = 4,
}

// 탭 정보를 관리하는 배열
const TAB_INFO = [
  { label: '기본 정보', value: TabType.BASIC_INFO },
  { label: '학력', value: TabType.EDUCATION },
  { label: '자격증', value: TabType.CERTIFICATION },
  { label: '근무 이력', value: TabType.WORK_HISTORY },
  { label: '기술 이력', value: TabType.SKILL_HISTORY },
];

const positions = ['사원', '대리', '과장', '차장', '부장', '이사'];
const grades = ['신입', '초급', '중급', '고급', '특급'];
const sexOptions = [
  { value: 'M', label: '남성' },
  { value: 'F', label: '여성' },
];
const marriedOptions = [
  { value: 'Y', label: '기혼' },
  { value: 'N', label: '미혼' },
];

const emptyDeveloper: Partial<Developer> = {
  developer_name: '',
  developer_birth: '',
  developer_sex: 'M',
  developer_email: '',
  developer_phone: '',
  developer_addr: '',
  developer_current_position: '사원',
  developer_grade: '초급',
  developer_married: 'N',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
const IMG_BASE_URL = API_BASE_URL.replace('/api', ''); // 백엔드 기본 URL

// 이미지 URL을 정규화하는 함수 추가
const normalizeImageUrl = (imageUrl: string | undefined) => {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${IMG_BASE_URL}${imageUrl}`;
};

export default function DeveloperDetailForm({ 
  developer, 
  isCreating = false,
  onSave,
  onCancel
}: DeveloperDetailFormProps) {
  const [formData, setFormData] = useState<Partial<Developer>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [currentTab, setCurrentTab] = useState(TabType.BASIC_INFO);
  const [skills, setSkills] = useState<DeveloperSkill[]>([]);
  const [schools, setSchools] = useState<SchoolInfo[]>([]);
  const [works, setWorks] = useState<WorkInfo[]>([]);
  const [certifications, setCertifications] = useState<CertificationInfo[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    if (isCreating) {
      setFormData(emptyDeveloper);
      setCurrentTab(TabType.BASIC_INFO);
    } else if (developer) {
      setFormData(developer);
      setCurrentTab(TabType.BASIC_INFO);
      setIsEditing(false);
      setErrors({});
      setShowErrorMessage(false);
    }
  }, [developer, isCreating]);

  const handleTabChange = async (newValue: TabType) => {
    setCurrentTab(newValue);
    setSelectedItems([]); // 탭 변경 시 선택된 항목 초기화
    if (!developer?.developer_id) return;

    try {
      switch (newValue) {
        case TabType.EDUCATION:
          await loadSchoolInfo(developer.developer_id);
          break;
        case TabType.CERTIFICATION:
          await loadCertificationInfo(developer.developer_id);
          break;
        case TabType.WORK_HISTORY:
          await loadWorkInfo(developer.developer_id);
          break;
        case TabType.SKILL_HISTORY:
          await loadDeveloperSkills(developer.developer_id);
          break;
      }
    } catch (error) {
      console.error('탭 데이터 로드 중 오류:', error);
    }
  };

  const loadDeveloperSkills = async (developerId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/developers/${developerId}/skills`);
      setSkills(response.data.skills);
    } catch (error) {
      console.error('기술 정보 로드 중 오류:', error);
    }
  };

  const loadSchoolInfo = async (developerId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/developers/${developerId}/schools`);
      setSchools(response.data);
    } catch (error) {
      console.error('학력 정보 로드 중 오류:', error);
    }
  };

  const loadWorkInfo = async (developerId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/developers/${developerId}/works`);
      setWorks(response.data);
    } catch (error) {
      console.error('근무 이력 로드 중 오류:', error);
    }
  };

  const loadCertificationInfo = async (developerId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/developers/${developerId}/certifications`);
      setCertifications(response.data);
    } catch (error) {
      console.error('자격증 정보 로드 중 오류:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // 필수 필드 검증
    if (!formData.developer_name?.trim()) {
      newErrors.developer_name = '이름은 필수 입력 항목입니다.';
      isValid = false;
    }

    if (!formData.developer_phone?.trim()) {
      newErrors.developer_phone = '전화번호는 필수 입력 항목입니다.';
      isValid = false;
    }

    if (!formData.developer_birth) {
      newErrors.developer_birth = '생년월일은 필수 입력 항목입니다.';
      isValid = false;
    }

    if (!formData.developer_sex) {
      newErrors.developer_sex = '성별은 필수 선택 항목입니다.';
      isValid = false;
    }

    if (!formData.developer_email?.trim()) {
      newErrors.developer_email = '이메일은 필수 입력 항목입니다.';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.developer_email)) {
      newErrors.developer_email = '올바른 이메일 형식이 아닙니다.';
      isValid = false;
    }

    if (!formData.developer_addr?.trim()) {
      newErrors.developer_addr = '주소는 필수 입력 항목입니다.';
      isValid = false;
    }

    if (!formData.developer_current_position) {
      newErrors.developer_current_position = '직급은 필수 선택 항목입니다.';
      isValid = false;
    }

    if (!formData.developer_grade) {
      newErrors.developer_grade = '등급은 필수 선택 항목입니다.';
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      setShowErrorMessage(true);
    }
    return isValid;
  };

  const formatPhoneNumber = (phone: string): string => {
    // 숫자만 추출
    const numbers = phone.replace(/[^\d]/g, '');
    
    // 11자리 숫자인 경우에만 하이픈 추가
    if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
    return phone;
  };

  const handleSave = () => {
    if (validateForm()) {
      // 저장하기 전에 데이터 형식 확인 및 변환
      const dataToSave = {
        ...formData,
        developer_birth: formData.developer_birth || '',
        developer_name: formData.developer_name || '',
        developer_sex: formData.developer_sex || '',
        developer_email: formData.developer_email || '',
        developer_phone: formData.developer_phone ? formatPhoneNumber(formData.developer_phone) : '',
        developer_addr: formData.developer_addr || '',
        developer_current_position: formData.developer_current_position || '',
        developer_grade: formData.developer_grade || '',
      };

      // 선택적 필드들은 값이 있을 때만 포함
      if (formData.developer_start_date) {
        dataToSave.developer_start_date = formData.developer_start_date;
      }
      if (formData.developer_career_start_date) {
        dataToSave.developer_career_start_date = formData.developer_career_start_date;
      }
      if (formData.developer_married) {
        dataToSave.developer_married = formData.developer_married;
      }
      if (formData.developer_military_start_date) {
        dataToSave.developer_military_start_date = formData.developer_military_start_date;
      }
      if (formData.developer_military_end_date) {
        dataToSave.developer_military_end_date = formData.developer_military_end_date;
      }
      if (formData.developer_military_desc) {
        dataToSave.developer_military_desc = formData.developer_military_desc;
      }

      console.log('Saving developer data:', dataToSave);
      onSave(dataToSave);
      if (!isCreating) {
        setIsEditing(false);
      }
    }
  };

  const handleCancel = () => {
    // Clear error states
    setErrors({});
    setShowErrorMessage(false);
    
    if (isCreating && onCancel) {
      onCancel();
    } else if (developer) {
      setFormData(developer);
      setIsEditing(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      // 파일 형식 검증
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('잘못된 파일 형식입니다. (JPEG, PNG, GIF만 허용)');
        return;
      }

      // 파일 크기 검증 (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setUploadError('파일의 용량이 너무 큽니다. (최대 10MB)');
        return;
      }

      if (!formData.developer_id) {
        setUploadError('개발자 정보를 먼저 저장해주세요.');
        return;
      }

      const uploadFormData = new FormData();
      uploadFormData.append('profile_image', file);

      const response = await axios.post(
        `${API_BASE_URL}/developers/${formData.developer_id}/profile-image`,
        uploadFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.imageUrl) {
        setFormData(prev => ({
          ...prev,
          developer_profile_image: normalizeImageUrl(response.data.imageUrl)
        }));
        setUploadError('');
      }
    } catch (error: any) {
      console.error('이미지 업로드 중 오류:', error);
      setUploadError(
        error.response?.data?.message || 
        '이미지 업로드에 실패했습니다. 다시 시도해주세요.'
      );
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    if (!developer?.developer_id) return;
    
    try {
      let endpoint = '';
      switch (currentTab) {
        case TabType.EDUCATION:
          endpoint = `${API_BASE_URL}/developers/${developer.developer_id}/schools`;
          break;
        case TabType.CERTIFICATION:
          endpoint = `${API_BASE_URL}/developers/${developer.developer_id}/certifications`;
          break;
        case TabType.WORK_HISTORY:
          endpoint = `${API_BASE_URL}/developers/${developer.developer_id}/works`;
          break;
        case TabType.SKILL_HISTORY:
          endpoint = `${API_BASE_URL}/developers/${developer.developer_id}/skills`;
          break;
      }

      await axios.delete(endpoint, { data: { ids } });
      setSelectedItems([]);
      handleTabChange(currentTab); // 데이터 새로고침
    } catch (error) {
      console.error('데이터 삭제 중 오류:', error);
    }
  };

  if (!developer && !isCreating) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">개발자를 선택하거나 새로 등록해주세요</Typography>
      </Paper>
    );
  }

  const handleDateChange = (field: string) => (date: Date | null) => {
    if (date) {
      setFormData({
        ...formData,
        [field]: date.toISOString().split('T')[0],
      });
    }
  };

  return (
    <Paper sx={{ p: 2, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
        <Typography variant="h6">
          {isCreating ? '새 개발자 등록' : '개발자 상세 정보'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {currentTab === TabType.BASIC_INFO && (
            <>
              {(isEditing || isCreating) && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleCancel}
                >
                  취소
                </Button>
              )}
              <Button
                variant="contained"
                color={isEditing || isCreating ? "success" : "primary"}
                onClick={() => isEditing || isCreating ? handleSave() : setIsEditing(true)}
              >
                {isEditing || isCreating ? '저장' : '수정'}
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Snackbar
        open={showErrorMessage}
        autoHideDuration={6000}
        onClose={() => setShowErrorMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowErrorMessage(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          필수 입력 항목을 모두 입력해주세요.
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!uploadError}
        autoHideDuration={6000}
        onClose={() => setUploadError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setUploadError('')}
          severity="error"
          sx={{ width: '100%' }}
        >
          {uploadError}
        </Alert>
      </Snackbar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => handleTabChange(newValue)}>
          {TAB_INFO.map((tab) => (
            <Tab 
              key={tab.value} 
              label={tab.label} 
              disabled={isCreating && tab.value !== TabType.BASIC_INFO}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, overflow: 'auto' }}>
        {currentTab === TabType.BASIC_INFO ? (
          <>
            {/* 기존의 기본 정보 내용 */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              {/* 프로필 이미지 */}
              <Box sx={{ 
                width: '250px',
                height: '250px',
                flexShrink: 0,
                bgcolor: 'grey.200', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                p: 1,
              }}>
                {formData.developer_profile_image ? (
                  <Box sx={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <img 
                      src={formData.developer_profile_image}
                      alt="프로필" 
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '4px',
                      }}
                      onError={(e) => {
                        console.error('이미지 로드 실패');
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '';
                        setFormData(prev => ({
                          ...prev,
                          developer_profile_image: undefined
                        }));
                      }}
                    />
                  </Box>
                ) : (
                  <Avatar sx={{ 
                    width: '80%', 
                    height: '80%',
                    bgcolor: 'primary.main' 
                  }}>
                    {formData.developer_name?.[0] || '?'}
                  </Avatar>
                )}
                {(isEditing || isCreating) && (
                  <Button
                    variant="contained"
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                      },
                      minWidth: '120px',
                      fontSize: '0.875rem',
                    }}
                  >
                    사진 업로드
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                    />
                  </Button>
                )}
              </Box>

              {/* 기본 정보 */}
              <Box sx={{ flexGrow: 1 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                  <Grid container spacing={1} >
                    <Grid item xs={12} >
                      <TextField
                        required
                        fullWidth
                        label="이름"
                        value={formData.developer_name || ''}
                        onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })}
                        disabled={!isEditing && !isCreating}
                        error={!!errors.developer_name}
                        helperText={errors.developer_name}
                      />
                    </Grid>
                    <Grid item xs={12} >
                      <FormControl 
                        fullWidth 
                        required 
                        disabled={!isEditing && !isCreating}
                        error={!!errors.developer_sex}
                      >
                        <InputLabel>성별</InputLabel>
                        <Select
                          value={formData.developer_sex || ''}
                          onChange={(e) => setFormData({ ...formData, developer_sex: e.target.value })}
                          label="성별"
                        >
                          {sexOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} >
                      <DatePicker
                        label="생년월일"
                        value={formData.developer_birth ? new Date(formData.developer_birth) : null}
                        onChange={(date) => {
                          if (date) {
                            const formattedDate = date.toISOString().split('T')[0];
                            setFormData({ ...formData, developer_birth: formattedDate });
                          } else {
                            setFormData({ ...formData, developer_birth: '' });
                          }
                        }}
                        disabled={!isEditing && !isCreating}
                        slotProps={{
                          textField: {
                            required: true,
                            fullWidth: true,
                            error: !!errors.developer_birth,
                            helperText: errors.developer_birth
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="전화번호"
                        value={formData.developer_phone || ''}
                        onChange={(e) => setFormData({ ...formData, developer_phone: e.target.value })}
                        disabled={!isEditing && !isCreating}
                        error={!!errors.developer_phone}
                        helperText={errors.developer_phone}
                        inputProps={{ 
                          maxLength: 13,
                          placeholder: '010-XXXX-XXXX'
                        }}
                      />
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              </Box>
            </Box>

            {/* 하단 섹션: 나머지 정보들 */}
            <Box sx={{ flexGrow: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <TextField
                      label="이메일"
                      value={formData.developer_email || ''}
                      onChange={(e) => setFormData({ ...formData, developer_email: e.target.value })}
                      disabled={!isEditing && !isCreating}
                      required
                      fullWidth
                      type="email"
                      error={!!errors.developer_email}
                      helperText={errors.developer_email}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="주소"
                      value={formData.developer_addr || ''}
                      onChange={(e) => setFormData({ ...formData, developer_addr: e.target.value })}
                      disabled={!isEditing && !isCreating}
                      error={!!errors.developer_addr}
                      helperText={errors.developer_addr}
                      required
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="입사일"
                      value={formData.developer_start_date ? new Date(formData.developer_start_date) : null}
                      onChange={handleDateChange('developer_start_date')}
                      disabled={!isEditing && !isCreating}
                      slotProps={{
                        textField: {
                          fullWidth: true
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="경력 시작일"
                      value={formData.developer_career_start_date ? new Date(formData.developer_career_start_date) : null}
                      onChange={handleDateChange('developer_career_start_date')}
                      disabled={!isEditing && !isCreating}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required disabled={!isEditing && !isCreating}>
                      <InputLabel>직급</InputLabel>
                      <Select
                        value={formData.developer_current_position || ''}
                        onChange={(e) => setFormData({ ...formData, developer_current_position: e.target.value })}
                        label="직급"
                      >
                        {positions.map((position) => (
                          <MenuItem key={position} value={position}>
                            {position}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required disabled={!isEditing && !isCreating}>
                      <InputLabel>등급</InputLabel>
                      <Select
                        value={formData.developer_grade || ''}
                        onChange={(e) => setFormData({ ...formData, developer_grade: e.target.value })}
                        label="등급"
                      >
                        {grades.map((grade) => (
                          <MenuItem key={grade} value={grade}>
                            {grade}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth disabled={!isEditing && !isCreating}>
                      <InputLabel>결혼여부</InputLabel>
                      <Select
                        value={formData.developer_married || ''}
                        onChange={(e) => setFormData({ ...formData, developer_married: e.target.value })}
                        label="결혼여부"
                      >
                        {marriedOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="입대일"
                      value={formData.developer_military_start_date ? new Date(formData.developer_military_start_date) : null}
                      onChange={handleDateChange('developer_military_start_date')}
                      disabled={!isEditing && !isCreating}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="제대일"
                      value={formData.developer_military_end_date ? new Date(formData.developer_military_end_date) : null}
                      onChange={handleDateChange('developer_military_end_date')}
                      disabled={!isEditing && !isCreating}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="역종/병과"
                      value={formData.developer_military_desc || ''}
                      onChange={(e) => setFormData({ ...formData, developer_military_desc: e.target.value })}
                      disabled={!isEditing && !isCreating}
                      fullWidth
                    />
                  </Grid>

                  {!isCreating && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          label="생성일"
                          value={formData.created_at ? new Date(formData.created_at).toLocaleString() : ''}
                          disabled
                          fullWidth
                        />
                        <TextField
                          label="수정일"
                          value={formData.updated_at ? new Date(formData.updated_at).toLocaleString() : ''}
                          disabled
                          fullWidth
                        />
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </LocalizationProvider>
            </Box>
          </>
        ) : currentTab === TabType.EDUCATION ? (
          <DeveloperSchoolInfo
            developerId={developer?.developer_id || ''}
          />
        ) : currentTab === TabType.CERTIFICATION ? (
          <DeveloperCertificationInfo
            developerId={developer?.developer_id || ''}
          />
        ) : currentTab === TabType.WORK_HISTORY ? (
          <DeveloperWorkInfo
            developerId={developer?.developer_id || ''}
          />
        ) : (
          <DeveloperSkillInfo
            developerId={developer?.developer_id || ''}
          />
        )}
      </Box>
    </Paper>
  );
}