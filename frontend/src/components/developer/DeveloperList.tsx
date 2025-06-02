import { useEffect, useState } from 'react';
import { Box, Typography, Checkbox } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Table } from '@/components/common/Table';
import { Button } from '@/components/common/Button';
import { useDeveloper } from '@/hooks/useDeveloper';
import { Developer } from '@/types/developer';
import { useRouter } from 'next/router';
import { developerService } from '@/services/developerService';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string;
  renderCell?: (row: Developer, checked: boolean, onCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void) => React.ReactNode;
}

const columns: Column[] = [
  { 
    id: 'checkbox',
    label: '', 
    minWidth: 50,
    renderCell: (row: Developer, checked: boolean, onCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void) => (
      <Checkbox
        checked={checked}
        onChange={(e) => onCheckboxChange(e, row.developer_id)}
        onClick={(e) => e.stopPropagation()}
      />
    )
  },
  { id: 'developer_name', label: '이름', minWidth: 100 },
  { id: 'developer_email', label: '이메일', minWidth: 170 },
  { id: 'developer_current_position', label: '현재 직급', minWidth: 130 },
  { id: 'developer_grade', label: '등급', minWidth: 100 },
  {
    id: 'developer_career_start_date',
    label: '경력 시작일',
    minWidth: 130,
    format: (value: Date) => value ? new Date(value).toLocaleDateString() : '-'
  }
];

export const DeveloperList = () => {
  const router = useRouter();
  const { developers, loading, error, fetchDevelopers } = useDeveloper();
  const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchDevelopers({ page, pageSize });
  }, [fetchDevelopers, page, pageSize]);

  const handleRowClick = (developer: Developer) => {
    router.push(`/developers/${developer.developer_id}`);
  };

  const handleAddClick = () => {
    router.push('/developers/new');
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (event.target.checked) {
      setSelectedDevelopers(prev => [...prev, id]);
    } else {
      setSelectedDevelopers(prev => prev.filter(devId => devId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm('선택한 개발자들을 삭제하시겠습니까?')) {
      try {
        await Promise.all(selectedDevelopers.map(id => developerService.deleteDeveloper(id)));
        setSelectedDevelopers([]);
        fetchDevelopers({ page, pageSize });
      } catch (error) {
        console.error('개발자 삭제 중 오류가 발생했습니다:', error);
        alert('개발자 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) return <Typography>로딩 중...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">개발자 목록</Typography>
        <Box>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSelected}
            disabled={selectedDevelopers.length === 0}
            startIcon={<DeleteIcon />}
            sx={{ mr: 2 }}
          >
            선택 삭제
          </Button>
          <Button variant="contained" color="primary" onClick={handleAddClick}>
            개발자 추가
          </Button>
        </Box>
      </Box>
      <Table
        columns={columns}
        rows={developers}
        onRowClick={handleRowClick}
        renderCell={(column, row) => {
          if (column.id === 'checkbox' && column.renderCell) {
            return column.renderCell(row, selectedDevelopers.includes(row.developer_id), handleCheckboxChange);
          }
          return undefined;
        }}
      />
    </Box>
  );
}; 