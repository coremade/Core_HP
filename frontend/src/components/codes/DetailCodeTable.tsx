import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Button,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commonCodeApi } from '../../api/commonCode';
import { DetailCode } from '../../types/commonCode';
import { useState } from 'react';
import DetailCodeForm from './DetailCodeForm';

interface DetailCodeTableProps {
  masterId: string | null;
  searchKeyword: string;
}

export default function DetailCodeTable({ masterId, searchKeyword }: DetailCodeTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DetailCode | null>(null);
  const [initialValues, setInitialValues] = useState<Partial<DetailCode> | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const queryClient = useQueryClient();

  const { data: detailCodes = [], isLoading } = useQuery<DetailCode[]>({
    queryKey: ['detailCodes', masterId],
    queryFn: () => masterId ? commonCodeApi.getDetailCodesByMasterId(masterId) : [],
    enabled: !!masterId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const deleteMutation = useMutation({
    mutationFn: commonCodeApi.deleteDetailCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detailCodes', masterId] });
    },
  });

  const filteredCodes = (detailCodes as DetailCode[]).filter(
    (code: DetailCode) =>
      code.detail_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      code.description.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleAddRow = () => {
    const newCode: Partial<DetailCode> = {
      detail_id: '',
      master_id: masterId!,
      detail_name: '',
      sort_order: filteredCodes.length + 1,
      description: '',
      extra_value1: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEditingCode(null);
    setInitialValues(newCode);
    setIsFormOpen(true);
  };

  const handleEdit = (code: DetailCode) => {
    console.log('📝 상세코드 수정 시작:', {
      detailId: code.detail_id,
      detailName: code.detail_name,
      masterId: code.master_id,
      timestamp: new Date().toISOString(),
      component: 'DetailCodeTable'
    });
    setEditingCode(code);
    setInitialValues(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    console.log('🔒 상세코드 수정 폼 닫기:', {
      timestamp: new Date().toISOString(),
      component: 'DetailCodeTable'
    });
    setIsFormOpen(false);
    setEditingCode(null);
  };

  const handleFormSubmit = (code: DetailCode) => {
    console.log('💾 상세코드 저장 완료:', {
      detailId: code.detail_id,
      detailName: code.detail_name,
      masterId: code.master_id,
      timestamp: new Date().toISOString(),
      component: 'DetailCodeTable'
    });
    setIsFormOpen(false);
    setEditingCode(null);
    queryClient.invalidateQueries({ queryKey: ['detailCodes', masterId] });
  };

  const handleDeleteRow = (row: DetailCode) => {
    if (window.confirm('선택한 행을 삭제하시겠습니까?')) {
      if (!row.detail_id.toString().startsWith('NEW_')) {
        deleteMutation.mutateAsync(row.detail_id);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'detail_id', headerName: '코드', width: 120 },
    { field: 'detail_name', headerName: '코드명', width: 150 },
    { field: 'sort_order', headerName: '정렬순서', width: 80, type: 'number' },
    { field: 'description', headerName: '설명', width: 250 },
    { field: 'extra_value1', headerName: '추가값1', width: 100 },
    {
      field: 'actions',
      headerName: '작업',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<DetailCode>) => (
        <Box>
          <Tooltip title="수정">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteRow(params.row)}
              disabled={params.row.detail_id.toString().startsWith('NEW_')}
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
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">상세 코드</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
            size="small"
          >
            행추가
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <DataGrid
          rows={filteredCodes}
          columns={columns}
          getRowId={(row) => row.detail_id}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          density="compact"
          disableRowSelectionOnClick
          sx={{ flex: 1, minHeight: 0 }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
        />
      </Paper>

      <DetailCodeForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        masterId={masterId}
        editingCode={editingCode}
        initialValues={initialValues ? {
          detail_id: initialValues.detail_id || '',
          detail_name: initialValues.detail_name || '',
          description: initialValues.description || '',
          sort_order: initialValues.sort_order || 0,
          extra_value1: initialValues.extra_value1 || '',
          master_id: initialValues.master_id || masterId || ''
        } : undefined}
      />
    </Box>
  );
} 