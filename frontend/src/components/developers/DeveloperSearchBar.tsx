import { useState } from 'react';
import { Paper, InputBase, IconButton, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface DeveloperSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  name?: string;
  position?: string;
  grade?: string;
}

const positions = ['사원', '대리', '과장', '차장', '부장'];
const grades = ['초급', '중급', '고급', '특급'];

export default function DeveloperSearchBar({ onSearch }: DeveloperSearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    position: '',
    grade: '',
  });

  const handleChange = (field: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Paper
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          flex: 2,
          minWidth: '200px',
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="개발자 이름 검색"
          value={filters.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        <IconButton type="button" sx={{ p: '10px' }}>
          <SearchIcon />
        </IconButton>
      </Paper>

      <FormControl sx={{ flex: 1, minWidth: '150px' }}>
        <InputLabel shrink >직급</InputLabel>
        <Select
          value={filters.position}
          label="직급"
          onChange={(e) => handleChange('position', e.target.value)}
          displayEmpty
        >
          <MenuItem value="">전체</MenuItem>
          {positions.map((position) => (
            <MenuItem key={position} value={position}>
              {position}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ flex: 1, minWidth: '150px' }}>
        <InputLabel shrink >등급</InputLabel>
        <Select
          value={filters.grade}
          label="등급"
          onChange={(e) => handleChange('grade', e.target.value)}
          displayEmpty
        >
          <MenuItem value="">전체</MenuItem>
          {grades.map((grade) => (
            <MenuItem key={grade} value={grade}>
              {grade}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
} 