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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commonCodeApi } from '../../../api/commonCode';
import { MasterCode } from '../../../types/commonCode';
import { useState } from 'react';
import CodeForm from './CodeForm';

interface MasterCodeListProps {
  onSelectMaster: (masterId: string | null) => void;
  searchKeyword: string;
}

export default function MasterCodeList({ onSelectMaster, searchKeyword }: MasterCodeListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<MasterCode | null>(null);
  const queryClient = useQueryClient();

  const { data: masterCodes = [], isLoading } = useQuery({
    queryKey: ['masterCodes'],
    queryFn: commonCodeApi.getAllMasterCodes,
  });

  const deleteMutation = useMutation({
    mutationFn: commonCodeApi.deleteMasterCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterCodes'] });
    },
  });

  const filteredCodes = masterCodes.filter(
    (code) =>
      code.master_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      code.description.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleEdit = (code: MasterCode) => {
    setEditingCode(code);
    setIsFormOpen(true);
  };

  const handleDelete = async (code: MasterCode) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteMutation.mutateAsync(code.master_id);
    }
  };

  if (isLoading) {
    return <Typography>로딩 중...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">마스터 코드</Typography>
        <Tooltip title="새 마스터 코드 추가">
          <IconButton onClick={() => setIsFormOpen(true)}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <List>
        {filteredCodes.map((code) => (
          <ListItem
            key={code.master_id}
            disablePadding
            secondaryAction={
              <Box>
                <IconButton edge="end" onClick={() => handleEdit(code)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(code)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemButton onClick={() => onSelectMaster(code.master_id)}>
              <ListItemIcon>
                <CodeIcon />
              </ListItemIcon>
              <ListItemText
                primary={code.master_name}
                secondary={
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {code.description}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <CodeForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCode(null);
        }}
        editingCode={editingCode}
      />
    </Box>
  );
} 