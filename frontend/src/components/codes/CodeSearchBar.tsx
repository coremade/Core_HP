import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useCallback } from 'react';
import { debounce } from 'lodash';

interface CodeSearchBarProps {
  onSearch: (keyword: string) => void;
}

export default function CodeSearchBar({ onSearch }: CodeSearchBarProps) {
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="코드명 또는 설명으로 검색"
        onChange={(e) => debouncedSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
} 