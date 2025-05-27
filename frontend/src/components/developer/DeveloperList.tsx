import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Table } from '@/components/common/Table';
import { Button } from '@/components/common/Button';
import { useDeveloper } from '@/hooks/useDeveloper';
import { Developer } from '@/types/developer';
import { useRouter } from 'next/router';

const columns = [
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

  useEffect(() => {
    fetchDevelopers();
  }, [fetchDevelopers]);

  const handleRowClick = (developer: Developer) => {
    router.push(`/developers/${developer.developer_id}`);
  };

  const handleAddClick = () => {
    router.push('/developers/new');
  };

  if (loading) return <Typography>로딩 중...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">개발자 목록</Typography>
        <Button variant="contained" color="primary" onClick={handleAddClick}>
          개발자 추가
        </Button>
      </Box>
      <Table
        columns={columns}
        rows={developers}
        onRowClick={handleRowClick}
      />
    </Box>
  );
}; 