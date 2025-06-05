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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface SchoolInfo {
  developer_id: string;
  school_graduation_ym: string;
  school_name: string;
  school_major: string;
}

interface DeveloperSchoolInfoProps {
  developerId: string;
}

interface FormErrors {
  school_graduation_ym?: string;
  school_name?: string;
  school_major?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

const pageSizeOptions = [10, 25, 50, 100];

export default function DeveloperSchoolInfo({ developerId }: DeveloperSchoolInfoProps) {
  const [schools, setSchools] = useState<SchoolInfo[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SchoolInfo | null>(null);
  const [formData, setFormData] = useState<Partial<SchoolInfo>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (developerId) {
      loadSchools();
    }
  }, [developerId, page, limit]);

  const loadSchools = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/developers/${developerId}/schools`, {
        params: {
          page,
          limit
        }
      });
      setSchools(response.data.schools);
      setTotal(response.data.total);
    } catch (error) {
      console.error('학력 정보 로드 중 오류:', error);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    setLimit(event.target.value as number);
    setPage(1);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleEdit = (item: SchoolInfo) => {
    setEditingItem(item);
    setFormData(item);
    setErrors({});
    setIsDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 졸업년월 검증
    if (!formData.school_graduation_ym) {
      newErrors.school_graduation_ym = '졸업년월은 필수 입력 항목입니다.';
      isValid = false;
    } else {
      const ym = formData.school_graduation_ym;
      if (!/^\d{6}$/.test(ym)) {
        newErrors.school_graduation_ym = '졸업년월은 YYYYMM 형식의 6자리 숫자여야 합니다.';
        isValid = false;
      } else {
        const year = parseInt(ym.slice(0, 4));
        const month = parseInt(ym.slice(4));
        if (month < 1 || month > 12) {
          newErrors.school_graduation_ym = '월은 01에서 12 사이의 값이어야 합니다.';
          isValid = false;
        }
        if (year < 1900 || year > new Date().getFullYear()) {
          newErrors.school_graduation_ym = '올바른 연도를 입력해주세요.';
          isValid = false;
        }
      }
    }

    // 학교명 검증
    if (!formData.school_name?.trim()) {
      newErrors.school_name = '학교명은 필수 입력 항목입니다.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!developerId) return;

    if (!validateForm()) {
      return;
    }

    try {
      const endpoint = `${API_BASE_URL}/developers/${developerId}/schools`;
      const data = {
        school_graduation_ym: formData.school_graduation_ym,
        school_name: formData.school_name,
        school_major: formData.school_major || null
      };

      // 전송되는 데이터 로깅
      console.log('학력 데이터 전송:', data);

      if (editingItem) {
        const response = await axios.put(`${endpoint}/${formData.school_graduation_ym}`, data);
        console.log('수정 응답:', response.data);
      } else {
        const response = await axios.post(endpoint, data);
        console.log('저장 응답:', response.data);
      }

      setIsDialogOpen(false);
      setFormData({});
      setEditingItem(null);
      setErrors({});
      loadSchools();
    } catch (error) {
      console.error('데이터 저장 중 오류:', error);
      // API 에러 응답 로깅
      if (axios.isAxiosError(error) && error.response) {
        console.error('API 에러 응답:', error.response.data);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (!developerId || selectedItems.length === 0) return;

    try {
      await axios.delete(`${API_BASE_URL}/developers/${developerId}/schools`, {
        data: { ids: selectedItems }
      });
      setSelectedItems([]);
      loadSchools();
    } catch (error) {
      console.error('데이터 삭제 중 오류:', error);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleGraduationYmChange = (value: string) => {
    try {
      // 입력값이 YYYY-MM 형식인지 확인
      if (/^\d{4}-\d{2}$/.test(value)) {
        const [year, month] = value.split('-').map(Number);
        
        // 유효한 연도와 월인지 확인
        if (year >= 1900 && year <= new Date().getFullYear() && month >= 1 && month <= 12) {
          // YYYYMM 형식으로 변환
          const formattedValue = `${year}${month.toString().padStart(2, '0')}`;
          setFormData({ ...formData, school_graduation_ym: formattedValue });
          return;
        }
      }
      
      // 숫자만 입력된 경우 (기존 로직)
      const numericValue = value.replace(/[^\d]/g, '');
      const truncatedValue = numericValue.slice(0, 6);
      setFormData({ ...formData, school_graduation_ym: truncatedValue });
    } catch (error) {
      console.error('졸업년월 입력 처리 중 오류:', error);
    }
  };

  const formatGraduationYm = (ym: string) => {
    if (!ym || ym.length !== 6) return ym;
    return `${ym.slice(0, 4)}-${ym.slice(4)}`;
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          startIcon={<AddIcon />}
        >
          학력 추가
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

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={schools.length > 0 && selectedItems.length === schools.length}
                  indeterminate={selectedItems.length > 0 && selectedItems.length < schools.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems(schools.map(school => school.school_graduation_ym));
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                />
              </TableCell>
              <TableCell>졸업년월</TableCell>
              <TableCell>학교명</TableCell>
              <TableCell>전공</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schools.map((school) => (
              <TableRow key={school.school_graduation_ym}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedItems.includes(school.school_graduation_ym)}
                    onChange={() => handleCheckboxChange(school.school_graduation_ym)}
                  />
                </TableCell>
                <TableCell>{formatGraduationYm(school.school_graduation_ym)}</TableCell>
                <TableCell>{school.school_name}</TableCell>
                <TableCell>{school.school_major || '-'}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleEdit(school)}
                  >
                    수정
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>페이지 크기</InputLabel>
          <Select
            value={limit}
            label="페이지 크기"
            onChange={handleLimitChange}
          >
            {pageSizeOptions.map((size) => (
              <MenuItem key={size} value={size}>
                {size}개씩
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Pagination
          count={Math.ceil(total / limit)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? '학력 정보 수정' : '학력 정보 추가'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <DatePicker
                label="졸업년월"
                value={formData.school_graduation_ym ? new Date(`${formData.school_graduation_ym.slice(0, 4)}-${formData.school_graduation_ym.slice(4)}-01`) : null}
                onChange={(newValue) => {
                  try {
                    if (newValue && !isNaN(newValue.getTime())) {
                      const formattedDate = format(newValue, 'yyyyMM');
                      setFormData({ ...formData, school_graduation_ym: formattedDate });
                    }
                  } catch (error) {
                    console.error('날짜 변환 중 오류:', error);
                  }
                }}
                disabled={!!editingItem}
                views={['year', 'month']}
                format="yyyy-MM"
                slotProps={{
                  textField: {
                    error: !!errors.school_graduation_ym,
                    helperText: errors.school_graduation_ym,
                    required: true,
                    fullWidth: true,
                    inputProps: {
                      placeholder: 'YYYY-MM',
                      maxLength: 7
                    }
                  }
                }}
              />
            </LocalizationProvider>
            <TextField
              label="학교명"
              value={formData.school_name || ''}
              onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
              error={!!errors.school_name}
              helperText={errors.school_name}
              required
            />
            <TextField
              label="전공"
              value={formData.school_major || ''}
              onChange={(e) => setFormData({ ...formData, school_major: e.target.value })}
              error={!!errors.school_major}
              helperText={errors.school_major}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">저장</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 