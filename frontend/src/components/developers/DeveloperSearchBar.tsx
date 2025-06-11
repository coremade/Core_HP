import { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, FormGroup, FormControlLabel, Checkbox, Typography } from '@mui/material';

interface DeveloperSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  name?: string;
  phone?: string;
  skills?: string;
  excludeSkills?: string;
  skillsCondition?: string;
  excludeSkillsCondition?: string;
  grades?: string[];
  genders?: string[];
}

const grades = ['초급', '중급', '고급', '특급'];
const genders = [
  { value: 'M', label: '남성' },
  { value: 'F', label: '여성' }
];
const skillsConditions = [
  { value: 'AND', label: 'AND (모든 기술 포함)' },
  { value: 'OR', label: 'OR (하나 이상 포함)' }
];

export default function DeveloperSearchBar({ onSearch }: DeveloperSearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    phone: '',
    skills: '',
    excludeSkills: '',
    skillsCondition: 'OR',
    excludeSkillsCondition: 'OR',
    grades: [...grades], // 모든 등급 선택
    genders: genders.map(g => g.value), // 모든 성별 선택
  });

  const handleChange = (field: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleCheckboxChange = (category: 'grades' | 'genders', value: string, checked: boolean) => {
    const currentValues = filters[category] || [];
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter((v: string) => v !== value);
    }
    
    const newFilters = { ...filters, [category]: newValues };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleSelectAll = (category: 'grades' | 'genders', allValues: string[], checked: boolean) => {
    const newValues = checked ? [...allValues] : [];
    const newFilters = { ...filters, [category]: newValues };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: '0 0 50%', display: 'flex', gap: 3 }}>
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
        </Box>
        <Box sx={{ flex: '0 0 50%', display: 'flex', gap: 3 }}>
          <TextField
            size="small"
            label="기술"
            InputLabelProps={{ shrink: true }}
            placeholder="기술로 검색 (콤마`,`로 구분)"
            value={filters.skills || ''}
            onChange={(e) => handleChange('skills', e.target.value)}
            sx={{ flex: 2.5 }}
          />

          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel shrink>기술 검색 조건</InputLabel>
            <Select
              value={filters.skillsCondition || 'OR'}
              label="기술 검색 조건"
              onChange={(e) => handleChange('skillsCondition', e.target.value)}
              displayEmpty
            >
              {skillsConditions.map((condition) => (
                <MenuItem key={condition.value} value={condition.value}>
                  {condition.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: '0 0 50%', display: 'flex', gap: 3 }}>
          <TextField
            size="small"
            label="제외 기술"
            InputLabelProps={{ shrink: true }}
            placeholder="제외할 기술로 검색 (콤마`,`로 구분)"
            value={filters.excludeSkills || ''}
            onChange={(e) => handleChange('excludeSkills', e.target.value)}
            sx={{ flex: 2.5 }}
          />

          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel shrink>제외 기술 검색 조건</InputLabel>
            <Select
              value={filters.excludeSkillsCondition || 'OR'}
              label="제외 기술 검색 조건"
              onChange={(e) => handleChange('excludeSkillsCondition', e.target.value)}
              displayEmpty
            >
              {skillsConditions.map((condition) => (
                <MenuItem key={condition.value} value={condition.value}>
                  {condition.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ flex: '0 0 50%' }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1.5, 
            alignItems: 'center',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            flexWrap: 'wrap',
            minHeight: '56px'
          }}>
            {/* 성별 체크박스 */}
            <Box sx={{ minWidth: 'fit-content', ml: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.2, fontWeight: 600, fontSize: '0.8rem' }}>성별</Typography>
              <FormGroup row sx={{ gap: 0.3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.genders?.length === genders.length}
                      onChange={(e) => handleSelectAll('genders', genders.map(g => g.value), e.target.checked)}
                    />
                  }
                  label="전체"
                  sx={{ 
                    mr: 0.3, 
                    '& .MuiFormControlLabel-label': { fontSize: '0.75rem' },
                    '& .MuiFormControlLabel-root': { margin: 0 },
                  }}
                />
                {genders.map((gender) => (
                  <FormControlLabel
                    key={gender.value}
                    control={
                      <Checkbox
                        size="small"
                        checked={filters.genders?.includes(gender.value) || false}
                        onChange={(e) => handleCheckboxChange('genders', gender.value, e.target.checked)}
                      />
                    }
                    label={gender.label}
                    sx={{ 
                      mr: 0.3, 
                      '& .MuiFormControlLabel-label': { fontSize: '0.75rem' },
                      '& .MuiFormControlLabel-root': { margin: 0 },
                      margin: 0
                    }}
                  />
                ))}
              </FormGroup>
            </Box>

            {/* 구분선 */}
            <Box sx={{ 
              borderLeft: '1px dashed #ccc', 
              height: '40px', 
              alignSelf: 'center' 
            }} />

            {/* 등급 체크박스 */}
            <Box sx={{ minWidth: 'fit-content' }}>
              <Typography variant="subtitle2" sx={{ mb: 0.2, fontWeight: 600, fontSize: '0.8rem' }}>등급</Typography>
              <FormGroup row sx={{ gap: 0.3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.grades?.length === grades.length}
                      onChange={(e) => handleSelectAll('grades', grades, e.target.checked)}
                    />
                  }
                  label="전체"
                  sx={{ 
                    mr: 0.3, 
                    '& .MuiFormControlLabel-label': { fontSize: '0.75rem' },
                    '& .MuiFormControlLabel-root': { margin: 0 },
                  }}
                />
                {grades.map((grade) => (
                  <FormControlLabel
                    key={grade}
                    control={
                      <Checkbox
                        size="small"
                        checked={filters.grades?.includes(grade) || false}
                        onChange={(e) => handleCheckboxChange('grades', grade, e.target.checked)}
                      />
                    }
                    label={grade}
                    sx={{ 
                      mr: 0.3, 
                      '& .MuiFormControlLabel-label': { fontSize: '0.75rem' },
                      '& .MuiFormControlLabel-root': { margin: 0 },
                      margin: 0
                    }}
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 