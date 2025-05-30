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
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Developer } from '../../services/developerService';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ko } from 'date-fns/locale';

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
  developer_sex: '',
  developer_email: '',
  developer_phone: '',
  developer_addr: '',
  developer_current_position: '',
  developer_grade: '',
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

  useEffect(() => {
    if (isCreating) {
      setFormData(emptyDeveloper);
      setIsEditing(true);
    } else if (developer) {
      setFormData(developer);
      setIsEditing(false);
    } else {
      setFormData({});
      setIsEditing(false);
    }
    // Clear error states
    setErrors({});
    setShowErrorMessage(false);
  }, [developer, isCreating]);

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

  const handleSave = () => {
    if (validateForm()) {
      // 저장하기 전에 데이터 형식 확인 및 변환
      const dataToSave = {
        ...formData,
        developer_birth: formData.developer_birth || '',
        developer_name: formData.developer_name || '',
        developer_sex: formData.developer_sex || '',
        developer_email: formData.developer_email || '',
        developer_phone: formData.developer_phone || '',
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {isCreating ? '새 개발자 등록' : '개발자 상세 정보'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
        </Box>
      </Box>

      <Box component="form" sx={{ flex: 1, overflow: 'auto' }}>
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

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
          <Grid container spacing={2} mt={0}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="developer_name"
                name="developer_name"
                label="이름"
                value={formData.developer_name || ''}
                onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })}
                disabled={!isEditing && !isCreating}
                error={!!errors.developer_name}
                helperText={errors.developer_name}
              />
            </Grid>

            <Grid item xs={12} md={6}>
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
                {errors.developer_sex && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {errors.developer_sex}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="developer_phone"
                name="developer_phone"
                label="전화번호"
                value={formData.developer_phone || ''}
                onChange={(e) => setFormData({ ...formData, developer_phone: e.target.value })}
                disabled={!isEditing && !isCreating}
                error={!!errors.developer_phone}
                helperText={errors.developer_phone}
                inputProps={{ maxLength: 20 }}
              />
            </Grid>

            <Grid item xs={12} >
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
          </Grid>
        </LocalizationProvider>

        {!isCreating && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: 'column' }}>
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
        )}
      </Box>
    </Paper>
  );
} 