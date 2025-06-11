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

interface WorkInfo {
  developer_id: string;
  work_start_ym: string;
  work_end_ym?: string | null;
  work_name: string;
  work_position: string;
  work_task?: string;
}

interface DeveloperWorkInfoProps {
  developerId: string;
  readonly?: boolean;
}

interface FormErrors {
  work_start_ym?: string;
  work_end_ym?: string;
  work_name?: string;
  work_position?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

const pageSizeOptions = [10, 25, 50, 100];

const formatYearMonth = (ym: string) => {
  if (!ym || ym.length !== 6) return ym;
  return `${ym.slice(0, 4)}-${ym.slice(4)}`;
};

const truncateText = (text: string | null | undefined, maxLength: number = 10) => {
  if (!text) return '-';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export default function DeveloperWorkInfo({ developerId, readonly = false }: DeveloperWorkInfoProps) {
  const [works, setWorks] = useState<WorkInfo[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkInfo | null>(null);
  const [formData, setFormData] = useState<Partial<WorkInfo>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (developerId) {
      loadWorks();
    }
  }, [developerId, page, limit]);

  const loadWorks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/developers/${developerId}/works`, {
        params: {
          page,
          limit
        }
      });
      setWorks(response.data.works);
      setTotal(response.data.total);
    } catch (error) {
      console.error('근무 이력 로드 중 오류:', error);
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

  const handleEdit = (item: WorkInfo) => {
    setEditingItem(item);
    setFormData(item);
    setErrors({});
    setIsDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 근무 시작일 검증
    if (!formData.work_start_ym) {
      newErrors.work_start_ym = '근무 시작일은 필수 입력 항목입니다.';
      isValid = false;
    } else {
      const date = formData.work_start_ym;
      if (!/^\d{6}$/.test(date)) {
        newErrors.work_start_ym = '근무 시작일은 YYYYMM 형식의 6자리 숫자여야 합니다.';
        isValid = false;
      } else {
        const year = parseInt(date.slice(0, 4));
        const month = parseInt(date.slice(4));
        if (month < 1 || month > 12) {
          newErrors.work_start_ym = '월은 01에서 12 사이의 값이어야 합니다.';
          isValid = false;
        }
        if (year < 1900 || year > new Date().getFullYear()) {
          newErrors.work_start_ym = '올바른 연도를 입력해주세요.';
          isValid = false;
        }
      }
    }

    // 근무 종료일 검증 (있는 경우)
    if (formData.work_end_ym) {
      const date = formData.work_end_ym;
      if (!/^\d{6}$/.test(date)) {
        newErrors.work_end_ym = '근무 종료일은 YYYYMM 형식의 6자리 숫자여야 합니다.';
        isValid = false;
      } else {
        const year = parseInt(date.slice(0, 4));
        const month = parseInt(date.slice(4));
        if (month < 1 || month > 12) {
          newErrors.work_end_ym = '월은 01에서 12 사이의 값이어야 합니다.';
          isValid = false;
        }
        if (year < 1900 || year > new Date().getFullYear()) {
          newErrors.work_end_ym = '올바른 연도를 입력해주세요.';
          isValid = false;
        }

        // 시작일보다 종료일이 빠른지 검증
        if (formData.work_start_ym && parseInt(date) < parseInt(formData.work_start_ym)) {
          newErrors.work_end_ym = '근무 종료일은 시작일보다 빠를 수 없습니다.';
          isValid = false;
        }
      }
    }

    // 회사명 검증
    if (!formData.work_name?.trim()) {
      newErrors.work_name = '회사명은 필수 입력 항목입니다.';
      isValid = false;
    }

    // 직책 검증
    if (!formData.work_position?.trim()) {
      newErrors.work_position = '직책은 필수 입력 항목입니다.';
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
      const endpoint = `${API_BASE_URL}/developers/${developerId}/works`;
      const data = {
        work_start_ym: formData.work_start_ym,
        work_end_ym: formData.work_end_ym || null,
        work_name: formData.work_name,
        work_position: formData.work_position,
        work_task: formData.work_task || null
      };

      if (editingItem) {
        await axios.put(`${endpoint}/${editingItem.work_start_ym}`, data);
      } else {
        await axios.post(endpoint, data);
      }

      setIsDialogOpen(false);
      setFormData({});
      setEditingItem(null);
      setErrors({});
      loadWorks();
    } catch (error) {
      console.error('데이터 저장 중 오류:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (!developerId || selectedItems.length === 0) return;

    try {
      await axios.delete(`${API_BASE_URL}/developers/${developerId}/works`, {
        data: { ids: selectedItems }
      });
      setSelectedItems([]);
      loadWorks();
    } catch (error) {
      console.error('데이터 삭제 중 오류:', error);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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
            근무 이력 추가
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
                    checked={works.length > 0 && selectedItems.length === works.length}
                    indeterminate={selectedItems.length > 0 && selectedItems.length < works.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(works.map(work => work.work_start_ym));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                  />
                </TableCell>
              )}
              <TableCell>시작년월</TableCell>
              <TableCell>종료년월</TableCell>
              <TableCell>회사명</TableCell>
              <TableCell>직책</TableCell>
              <TableCell>설명</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {works.map((work) => (
              <TableRow key={work.work_start_ym}>
                {!readonly && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedItems.includes(work.work_start_ym)}
                      onChange={() => handleCheckboxChange(work.work_start_ym)}
                    />
                  </TableCell>
                )}
                <TableCell>{formatYearMonth(work.work_start_ym)}</TableCell>
                <TableCell>{work.work_end_ym ? formatYearMonth(work.work_end_ym) : '재직중'}</TableCell>
                <TableCell>{work.work_name}</TableCell>
                <TableCell>{work.work_position || '-'}</TableCell>
                <TableCell title={work.work_task || ''}>{truncateText(work.work_task)}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleEdit(work)}
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
            ? '근무 이력' 
            : (editingItem ? '근무 이력 수정' : '근무 이력 추가')
          }
        </DialogTitle>
        <DialogContent sx={{ px: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
              <DatePicker
                label="시작년월"
                value={formData.work_start_ym ? new Date(`${formData.work_start_ym.slice(0, 4)}-${formData.work_start_ym.slice(4)}-01`) : null}
                onChange={(newValue) => {
                  try {
                    if (newValue && !isNaN(newValue.getTime())) {
                      const formattedDate = format(newValue, 'yyyyMM');
                      setFormData({ ...formData, work_start_ym: formattedDate });
                    }
                  } catch (error) {
                    console.error('날짜 변환 중 오류:', error);
                  }
                }}
                disabled={readonly || !!editingItem}
                views={['year', 'month']}
                format="yyyy-MM"
                slotProps={{
                  textField: {
                    error: !readonly && !!errors.work_start_ym,
                    helperText: !readonly ? errors.work_start_ym : undefined,
                    required: !readonly,
                    fullWidth: true,
                    InputProps: { readOnly: readonly },
                    variant: readonly ? "standard" : "outlined",
                    inputProps: {
                      placeholder: 'YYYY-MM',
                      maxLength: 7
                    }
                  }
                }}
              />
              <DatePicker
                label="종료년월"
                value={formData.work_end_ym ? new Date(`${formData.work_end_ym.slice(0, 4)}-${formData.work_end_ym.slice(4)}-01`) : null}
                onChange={(newValue) => {
                  try {
                    if (newValue && !isNaN(newValue.getTime())) {
                      const formattedDate = format(newValue, 'yyyyMM');
                      setFormData({ ...formData, work_end_ym: formattedDate });
                    } else {
                      setFormData({ ...formData, work_end_ym: undefined });
                    }
                  } catch (error) {
                    console.error('날짜 변환 중 오류:', error);
                  }
                }}
                disabled={readonly}
                views={['year', 'month']}
                format="yyyy-MM"
                slotProps={{
                  textField: {
                    error: !readonly && !!errors.work_end_ym,
                    helperText: !readonly ? (errors.work_end_ym || '재직중인 경우 비워두세요') : undefined,
                    fullWidth: true,
                    InputProps: { readOnly: readonly },
                    variant: readonly ? "standard" : "outlined",
                    inputProps: {
                      placeholder: 'YYYY-MM',
                      maxLength: 7
                    }
                  }
                }}
              />
            </LocalizationProvider>
            <TextField
              label="회사명"
              value={formData.work_name || ''}
              onChange={(e) => setFormData({ ...formData, work_name: e.target.value })}
              error={!readonly && !!errors.work_name}
              helperText={!readonly ? errors.work_name : undefined}
              required={!readonly}
              InputProps={{ readOnly: readonly }}
              variant={readonly ? "standard" : "outlined"}
            />
            <TextField
              label="직책"
              value={formData.work_position || ''}
              onChange={(e) => setFormData({ ...formData, work_position: e.target.value })}
              error={!readonly && !!errors.work_position}
              helperText={!readonly ? errors.work_position : undefined}
              required={!readonly}
              InputProps={{ readOnly: readonly }}
              variant={readonly ? "standard" : "outlined"}
            />
            <TextField
              label="설명"
              value={formData.work_task || ''}
              onChange={(e) => setFormData({ ...formData, work_task: e.target.value })}
              multiline
              rows={4}
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