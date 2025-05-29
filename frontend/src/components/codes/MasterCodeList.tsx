import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Paper,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commonCodeApi } from '../../api/commonCode';
import { MasterCode } from '../../types/commonCode';
import { useState, useEffect } from 'react';
import CodeForm from './CodeForm';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel } from '@mui/x-data-grid';

interface MasterCodeListProps {
  onSelectMaster: (masterId: string | null) => void;
  searchKeyword: string;
  selectedMasterCode: string | null;
}

export default function MasterCodeList({ onSelectMaster, searchKeyword, selectedMasterCode }: MasterCodeListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<MasterCode | null>(null);
  const queryClient = useQueryClient();

  const { data: masterCodes = [], isLoading } = useQuery({
    queryKey: ['masterCodes'],
    queryFn: commonCodeApi.getAllMasterCodes,
  });

  useEffect(() => {
    if (
      masterCodes.length > 0 &&
      !searchKeyword &&
      !selectedMasterCode &&
      masterCodes[0].master_id
    ) {
      console.log('🔄 초기 마스터코드 자동 선택:', {
        masterId: masterCodes[0].master_id,
        timestamp: new Date().toISOString(),
        component: 'MasterCodeList'
      });
      onSelectMaster(masterCodes[0].master_id);
    }
  }, [masterCodes, onSelectMaster, searchKeyword, selectedMasterCode]);

  const deleteMutation = useMutation({
    mutationFn: commonCodeApi.deleteMasterCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterCodes'] });
    },
  });

  const filteredCodes = masterCodes.filter(
    (code: MasterCode) =>
      (code.master_name?.toLowerCase() || '').includes(searchKeyword.toLowerCase()) ||
      (code.description?.toLowerCase() || '').includes(searchKeyword.toLowerCase())
  );

  const handleEdit = (code: MasterCode) => {
    console.log('📝 마스터코드 수정 시작:', {
      masterId: code.master_id,
      masterName: code.master_name,
      timestamp: new Date().toISOString(),
      component: 'MasterCodeList'
    });
    setEditingCode(code);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    console.log('🔒 마스터코드 수정 폼 닫기:', {
      timestamp: new Date().toISOString(),
      component: 'MasterCodeList'
    });
    setIsFormOpen(false);
    setEditingCode(null);
  };

  const handleFormSubmit = (code: MasterCode) => {
    console.log('💾 마스터코드 저장 완료:', {
      masterId: code.master_id,
      masterName: code.master_name,
      timestamp: new Date().toISOString(),
      component: 'MasterCodeList'
    });
    setIsFormOpen(false);
    setEditingCode(null);
    queryClient.invalidateQueries({ queryKey: ['masterCodes'] });
  };

  const handleDelete = async (code: MasterCode) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteMutation.mutateAsync(code.master_id);
    }
  };

  const columns: GridColDef[] = [
    { field: 'master_id', headerName: '코드', width: 100, minWidth: 80 },
    { field: 'master_name', headerName: '코드명', width: 150, minWidth: 120 },
    { field: 'description', headerName: '설명', width: 250, minWidth: 200, flex: 1 },
    {
      field: 'actions',
      headerName: '작업',
      width: 100,
      minWidth: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton edge="end" size="small" color="primary" onClick={() => handleEdit(params.row as MasterCode)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton edge="end" size="small" color="error" onClick={() => handleDelete(params.row as MasterCode)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return <Typography>로딩 중...</Typography>;
  }

  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">마스터 코드</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsFormOpen(true)}
          size="small"
        >
          행추가
        </Button>
      </Box>
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <DataGrid
          rows={filteredCodes}
          columns={columns}
          getRowId={(row) => row.master_id}
          pageSizeOptions={[10, 25, 50, 100]}
          density="compact"
          sx={{
            flex: 1,
            minHeight: 0,
            '& .MuiDataGrid-row.selected': {
              backgroundColor: 'rgba(25, 118, 210, 0.08) !important',
            },
            '& .MuiDataGrid-cell': {
              padding: '0px 8px',
            },
            '& .MuiDataGrid-columnHeaders': {
              padding: '0px 8px',
            },
          }}
          onRowClick={(params) => {
            onSelectMaster(params.row.master_id);
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
        />
      </Paper>
      <CodeForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingCode={editingCode}
        initialValues={editingCode ? {
          master_id: editingCode.master_id,
          master_name: editingCode.master_name,
          description: editingCode.description || '',
          use_yn: editingCode.use_yn || 'Y'
        } : undefined}
      />
    </Box>
  );
} 