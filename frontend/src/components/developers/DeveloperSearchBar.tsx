import { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

interface DeveloperSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  name?: string;
  phone?: string;
  email?: string;
  skills?: string;
  position?: string;
  grade?: string;
  gender?: string;
}

const positions = ['사원', '대리', '과장', '차장', '부장'];
const grades = ['초급', '중급', '고급', '특급'];
const genders = [
  { value: 'M', label: '남성' },
  { value: 'F', label: '여성' }
];

export default function DeveloperSearchBar({ onSearch }: DeveloperSearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    phone: '',
    email: '',
    skills: '',
    position: '',
    grade: '',
    gender: '',
  });

  const handleChange = (field: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ width: '100%', display: 'flex', gap: 2 }}>
        <TextField
          size="small"
          label="이름"
          InputLabelProps={{ shrink: true }}
          placeholder="이름으로 검색"
          value={filters.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          sx={{ flex: 1 }}
        />

        <TextField
          size="small"
          label="전화번호"
          InputLabelProps={{ shrink: true }}
          placeholder="전화번호로 검색"
          value={filters.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          sx={{ flex: 1 }}
        />

        <TextField
          size="small"
          label="이메일"
          InputLabelProps={{ shrink: true }}
          placeholder="이메일로 검색"
          value={filters.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          sx={{ flex: 1 }}
        />

        <TextField
          size="small"
          label="기술"
          InputLabelProps={{ shrink: true }}
          placeholder="기술로 검색"
          value={filters.skills || ''}
          onChange={(e) => handleChange('skills', e.target.value)}
          sx={{ flex: 1 }}
        />
      </Box>

      <Box sx={{ width: '100%', display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel shrink>성별</InputLabel>
          <Select
            value={filters.gender || ''}
            label="성별"
            onChange={(e) => handleChange('gender', e.target.value)}
            displayEmpty
          >
            <MenuItem value="">전체</MenuItem>
            {genders.map((gender) => (
              <MenuItem key={gender.value} value={gender.value}>
                {gender.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel shrink>직급</InputLabel>
          <Select
            value={filters.position || ''}
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

        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel shrink>등급</InputLabel>
          <Select
            value={filters.grade || ''}
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
    </Box>
  );
} 