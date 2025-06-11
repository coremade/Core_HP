import React, { useState, useEffect } from 'react';
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
  IconButton,
  InputAdornment,
  SelectChangeEvent,
  TextFieldProps
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import axios from 'axios';

interface CertificationInfo {
  developer_id: string;
  certification_date: string;
  certification_name: string;
  certification_agency: string;
}

interface DeveloperCertificationInfoProps {
  developerId: string;
  readonly?: boolean;
}

interface FormErrors {
  certification_date?: string;
  certification_name?: string;
  certification_agency?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

const pageSizeOptions = [10, 25, 50, 100];

export default function DeveloperCertificationInfo({ developerId, readonly = false }: DeveloperCertificationInfoProps) {
  const [certifications, setCertifications] = useState<CertificationInfo[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CertificationInfo | null>(null);
  const [formData, setFormData] = useState<Partial<CertificationInfo>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (developerId) {
      loadCertifications();
    }
  }, [developerId, page, limit]);

  const loadCertifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/developers/${developerId}/certifications`, {
        params: {
          page,
          limit
        }
      });
      setCertifications(response.data.certifications);
      setTotal(response.data.total);
    } catch (error) {
      console.error('자격증 정보 로드 중 오류:', error);
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
    setIsDialogOpen(true);
  };

  const handleEdit = (item: CertificationInfo) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 자격증 취득일자 검증
    if (!formData.certification_date) {
      newErrors.certification_date = '자격증 취득일자는 필수 입력 항목입니다.';
      isValid = false;
    } else {
      const date = formData.certification_date;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        newErrors.certification_date = '자격증 취득일자는 YYYY-MM-DD 형식이어야 합니다.';
        isValid = false;
      } else {
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        
        if (
          dateObj.getFullYear() !== year ||
          dateObj.getMonth() + 1 !== month ||
          dateObj.getDate() !== day ||
          year < 1900 ||
          year > new Date().getFullYear()
        ) {
          newErrors.certification_date = '올바른 날짜를 입력해주세요.';
          isValid = false;
        }
      }
    }

    // 자격증명 검증
    if (!formData.certification_name?.trim()) {
      newErrors.certification_name = '자격증명은 필수 입력 항목입니다.';
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
      const endpoint = `${API_BASE_URL}/developers/${developerId}/certifications`;
      const data = editingItem 
        ? {
            certification_name: formData.certification_name,
            certification_agency: formData.certification_agency || null
          }
        : {
            developer_id: developerId,
            certification_date: formData.certification_date,
            certification_name: formData.certification_name,
            certification_agency: formData.certification_agency || null
          };

      // 전송되는 데이터 로깅
      console.log('자격증 데이터 전송:', data);

      if (editingItem) {
        const response = await axios.put(`${endpoint}/${editingItem.certification_date}`, data);
        console.log('수정 응답:', response.data);
      } else {
        const response = await axios.post(endpoint, data);
        console.log('저장 응답:', response.data);
      }

      setIsDialogOpen(false);
      setFormData({});
      setEditingItem(null);
      setErrors({});
      loadCertifications();
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
      await axios.delete(`${API_BASE_URL}/developers/${developerId}/certifications`, {
        data: { ids: selectedItems }
      });
      setSelectedItems([]);
      loadCertifications();
    } catch (error) {
      console.error('데이터 삭제 중 오류:', error);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCertificationDateChange = (value: string) => {
    try {
      // 숫자와 하이픈만 허용
      const cleanValue = value.replace(/[^\d-]/g, '');
      
      // 년도가 4자리를 초과하지 않도록 처리
      const parts = cleanValue.split('-');
      if (parts[0] && parts[0].length > 4) {
        parts[0] = parts[0].slice(0, 4);
      }
      
      // 자동으로 하이픈 추가
      let formattedValue = parts[0] || '';
      if (parts[0] && parts[0].length === 4 && cleanValue.length >= 4) {
        formattedValue += '-';
        if (parts[1]) {
          // 월이 12를 초과하지 않도록
          const month = parseInt(parts[1]);
          if (month > 12) {
            parts[1] = '12';
          } else if (month < 1) {
            parts[1] = '01';
          } else {
            parts[1] = month.toString().padStart(2, '0');
          }
          formattedValue += parts[1];
          
          if (parts[1].length === 2 && cleanValue.length >= 7) {
            formattedValue += '-';
            if (parts[2]) {
              // 일이 31을 초과하지 않도록
              const day = parseInt(parts[2]);
              const maxDays = new Date(parseInt(parts[0]), parseInt(parts[1]), 0).getDate();
              if (day > maxDays) {
                parts[2] = maxDays.toString();
              } else if (day < 1) {
                parts[2] = '01';
              } else {
                parts[2] = day.toString().padStart(2, '0');
              }
              formattedValue += parts[2];
            }
          }
        }
      }
      
      // 날짜 유효성 검사
      if (formattedValue.length === 10) {
        const date = new Date(formattedValue);
        if (isNaN(date.getTime())) {
          return;
        }
      }
      
      setFormData({ ...formData, certification_date: formattedValue });
    } catch (error) {
      console.error('날짜 입력 처리 중 오류:', error);
    }
  };

  return (
    <>
      {!readonly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            startIcon={<AddIcon />}
          >
            자격증 추가
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
      )}

      <TableContainer component={Paper} >
        <Table>
          <TableHead>
            <TableRow>
              {!readonly && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={certifications.length > 0 && selectedItems.length === certifications.length}
                    indeterminate={selectedItems.length > 0 && selectedItems.length < certifications.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(certifications.map(cert => cert.certification_date));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                  />
                </TableCell>
              )}
              <TableCell>취득일자</TableCell>
              <TableCell>자격증명</TableCell>
              <TableCell>발급기관</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certifications.map((cert) => (
              <TableRow key={cert.certification_date}>
                {!readonly && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedItems.includes(cert.certification_date)}
                      onChange={() => handleCheckboxChange(cert.certification_date)}
                    />
                  </TableCell>
                )}
                <TableCell>{cert.certification_date}</TableCell>
                <TableCell>{cert.certification_name}</TableCell>
                <TableCell>{cert.certification_agency || '-'}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleEdit(cert)}
                  >
                    {readonly ? '상세보기' : '수정'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <DialogTitle>
          {readonly 
            ? '자격증 정보' 
            : (editingItem ? '자격증 정보 수정' : '자격증 정보 추가')
          }
        </DialogTitle>
        <DialogContent sx={{ px: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <DatePicker
                label="취득일자"
                value={formData.certification_date ? new Date(formData.certification_date) : null}
                onChange={(newValue) => {
                  try {
                    if (newValue && !isNaN(newValue.getTime())) {
                      const formattedDate = format(newValue, 'yyyy-MM-dd');
                      setFormData({ ...formData, certification_date: formattedDate });
                    }
                  } catch (error) {
                    console.error('날짜 변환 중 오류:', error);
                  }
                }}
                disabled={readonly || !!editingItem}
                format="yyyy-MM-dd"
                slotProps={{
                  textField: {
                    error: !readonly && !!errors.certification_date,
                    helperText: !readonly ? errors.certification_date : undefined,
                    required: !readonly,
                    fullWidth: true,
                    InputProps: { readOnly: readonly },
                    variant: readonly ? "standard" : "outlined",
                    inputProps: {
                      placeholder: 'YYYY-MM-DD',
                      maxLength: 10
                    },
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      if (value) {
                        handleCertificationDateChange(value);
                      }
                    }
                  }
                }}
              />
            </LocalizationProvider>
            <TextField
              label="자격증명"
              value={formData.certification_name || ''}
              onChange={(e) => setFormData({ ...formData, certification_name: e.target.value })}
              error={!readonly && !!errors.certification_name}
              helperText={!readonly ? errors.certification_name : undefined}
              required={!readonly}
              InputProps={{ readOnly: readonly }}
              variant={readonly ? "standard" : "outlined"}
            />
            <TextField
              label="발급기관"
              value={formData.certification_agency || ''}
              onChange={(e) => setFormData({ ...formData, certification_agency: e.target.value })}
              error={!readonly && !!errors.certification_agency}
              helperText={!readonly ? errors.certification_agency : undefined}
              InputProps={{ readOnly: readonly }}
              variant={readonly ? "standard" : "outlined"}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 2, justifyContent: 'flex-end' }}>
          <Button onClick={() => setIsDialogOpen(false)}>
            {readonly ? '닫기' : '취소'}
          </Button>
          {!readonly && (
            <Button onClick={handleSubmit} variant="contained">저장</Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
} 