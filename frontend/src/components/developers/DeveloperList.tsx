import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Paper,
  Typography,
  Box,
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Developer } from '../../services/developerService';
import { useState } from 'react';

interface DeveloperListProps {
  developers: Developer[];
  selectedDeveloperId: string | null;
  onSelectDeveloper: (developer: Developer) => void;
  onCreateNew: () => void;
  onDeleteDevelopers: (ids: (string | number)[]) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

const pageSizeOptions = [10, 25, 50, 100];

export default function DeveloperList({
  developers,
  selectedDeveloperId,
  onSelectDeveloper,
  onCreateNew,
  onDeleteDevelopers,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: DeveloperListProps) {
  const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    onPageSizeChange(event.target.value as number);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = developers.map(dev => dev.developer_id);
      setSelectedDevelopers(allIds);
    } else {
      setSelectedDevelopers([]);
    }
  };

  const handleCheckboxClick = (event: React.MouseEvent, developerId: string) => {
    event.stopPropagation();
  };

  const handleSelectDeveloper = (developerId: string) => {
    setSelectedDevelopers(prev => {
      if (prev.includes(developerId)) {
        return prev.filter(id => id !== developerId);
      } else {
        return [...prev, developerId];
      }
    });
  };

  const handleDelete = () => {
    if (selectedDevelopers.length === 0) return;

    if (window.confirm(`선택한 ${selectedDevelopers.length}명의 개발자를 삭제하시겠습니까?`)) {
      onDeleteDevelopers(selectedDevelopers);
      setSelectedDevelopers([]);
    }
  };

  // 생년월일을 YYYY-MM-DD 형식으로 변환하는 함수
  const formatBirthDate = (birth: number | null | undefined) => {
    if (!birth) return '-';
    const birthStr = birth.toString();
    const year = birthStr.substring(0, 4);
    const month = birthStr.substring(4, 6);
    const day = birthStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 2, height: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography color="textSecondary">로딩 중...</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">개발자 목록</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onCreateNew}
          >
            개발자 등록
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={selectedDevelopers.length === 0}
          >
            선택 삭제
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: '10px' }}>
                <Checkbox
                  indeterminate={selectedDevelopers.length > 0 && selectedDevelopers.length < developers.length}
                  checked={developers.length > 0 && selectedDevelopers.length === developers.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell width="20%">이름</TableCell>
              <TableCell width="25%">전화번호</TableCell>
              <TableCell width="25%">생년월일</TableCell>
              <TableCell width="10%">성별</TableCell>
              <TableCell width="10%">직급</TableCell>
              <TableCell width="10%">등급</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {developers.map((developer) => (
              <TableRow
                key={developer.developer_id}
                hover
                selected={selectedDeveloperId === developer.developer_id}
                onClick={() => onSelectDeveloper(developer)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell padding="checkbox" sx={{ width: '40px' }}>
                  <Checkbox
                    checked={selectedDevelopers.includes(developer.developer_id)}
                    onChange={(event) => handleSelectDeveloper(developer.developer_id)}
                    onClick={(event) => handleCheckboxClick(event, developer.developer_id)}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={developer.developer_profile_image}
                      alt={developer.developer_name}
                      sx={{ width: 32, height: 32 }}
                    >
                      {developer.developer_name[0]}
                    </Avatar>
                    {developer.developer_name}
                  </Box>
                </TableCell>
                <TableCell>{developer.developer_phone || '-'}</TableCell>
                <TableCell>{developer.developer_birth || '-'}</TableCell>
                <TableCell>{developer.developer_sex === 'M' ? '남성' : developer.developer_sex === 'F' ? '여성' : '-'}</TableCell>
                <TableCell>{developer.developer_current_position || '-'}</TableCell>
                <TableCell>{developer.developer_grade || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>페이지 크기</InputLabel>
          <Select
            value={pageSize}
            label="페이지 크기"
            onChange={handlePageSizeChange}
          >
            {pageSizeOptions.map((size) => (
              <MenuItem key={size} value={size}>
                {size}개씩
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Pagination
          count={Math.ceil(totalCount / pageSize)}
          page={page}
          onChange={(_, value) => onPageChange(value)}
          color="primary"
        />
      </Box>
    </Paper>
  );
} 