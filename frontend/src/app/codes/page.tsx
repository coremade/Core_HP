'use client';

import { useState } from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import MasterCodeList from '../../components/codes/MasterCodeList';
import DetailCodeTable from '../../components/codes/DetailCodeTable';
import CodeSearchBar from '../../components/codes/CodeSearchBar';
import { MasterCode } from '../../types/commonCode';

export default function CodesPage() {
  const [selectedMasterCode, setSelectedMasterCode] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [detailTableKey, setDetailTableKey] = useState(0);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleSelectMasterCode = (masterId: string | null) => {
    setSelectedMasterCode(masterId);
    setDetailTableKey(prev => prev + 1);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        공통코드 관리
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <CodeSearchBar onSearch={handleSearch} />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            마스터코드
          </Typography>
          <MasterCodeList 
            onSelectMaster={handleSelectMasterCode}
            searchKeyword={searchKeyword}
            selectedMasterCode={selectedMasterCode}
          />
        </Paper>

        <Paper sx={{ flex: 2, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            상세코드
          </Typography>
          <DetailCodeTable 
            masterId={selectedMasterCode}
            searchKeyword={searchKeyword}
          />
        </Paper>
      </Box>
    </Container>
  );
}
