import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commonCodeApi } from '../../../api/commonCode';
import { DetailCode } from '../../../types/commonCode';
import { useState } from 'react';
import DetailCodeForm from './DetailCodeForm';

interface DetailCodeTableProps {
  masterId: string | null;
  searchKeyword: string;
}

export default function DetailCodeTable({ masterId, searchKeyword }: DetailCodeTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DetailCode | null>(null);
  const queryClient = useQueryClient();

  const { data: detailCodes = [], isLoading } = useQuery({
    queryKey: ['detailCodes', masterId],
    queryFn: () => (masterId ? commonCodeApi.getDetailCodesByMasterId(masterId) : []),
    enabled: !!masterId,
  });

  const deleteMutation = useMutation({
    mutationFn: commonCodeApi.deleteDetailCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detailCodes', masterId] });
    },
  });

  const filteredCodes = detailCodes.filter(
    (code) =>
      code.detail_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      code.description.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'detail_id', headerName: '코드', width: 120 },
    { field: 'detail_name', headerName: '코드명', width: 200 },
    { field: 'sort_order', headerName: '정렬순서', width: 100, type: 'number' },
    { field: 'description', headerName: '설명', width: 300 },
    { field: 'use_yn', headerName: '사용여부', width: 100 },
    { field: 'extra_value1', headerName: '추가값1', width: 150 },
    { field: 'extra_value2', headerName: '추가값2', width: 150 },
    { field: 'extra_value3', headerName: '추가값3', width: 150 },
    {
      field: 'actions',
      headerName: '작업',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="수정">
            <IconButton
              size="small"
              onClick={() => {
                setEditingCode(params.row);
                setIsFormOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton
              size="small"
              onClick={() => {
                if (window.confirm('정말 삭제하시겠습니까?')) {
                  deleteMutation.mutateAsync(params.row.detail_id);
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (!masterId) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="text.secondary">마스터 코드를 선택해주세요</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return <Typography>로딩 중...</Typography>;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">상세 코드</Typography>
        <Tooltip title="새 상세 코드 추가">
          <IconButton onClick={() => setIsFormOpen(true)}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper sx={{ flex: 1 }}>
        <DataGrid
          rows={filteredCodes}
          columns={columns}
          paginationModel={{ pageSize: 10, page: 0 }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
          density="compact"
        />
      </Paper>

      <DetailCodeForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCode(null);
        }}
        masterId={masterId}
        editingCode={editingCode}
      />
    </Box>
  );
} 