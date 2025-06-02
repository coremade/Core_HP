'use client';

import { useState } from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import MasterCodeList from '../../components/codes/MasterCodeList';
import DetailCodeTable from '../../components/codes/DetailCodeTable';
import CodeSearchBar from '../../components/codes/CodeSearchBar';

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
    <Container maxWidth="xl" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 0, m: 0, overflow: 'hidden' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mt: 4, mb: 2 }}>
        공통코드 관리
      </Typography>
      <Box sx={{ mb: 2 }}>
        <CodeSearchBar onSearch={handleSearch} />
      </Box>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'stretch', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Paper sx={{ flex: 2, p: 2, minWidth: 380, height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <MasterCodeList 
            onSelectMaster={handleSelectMasterCode}
            searchKeyword={searchKeyword}
            selectedMasterCode={selectedMasterCode}
          />
        </Paper>
        <Paper sx={{ flex: 3, p: 2, minWidth: 420, height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <DetailCodeTable 
            masterId={selectedMasterCode}
            searchKeyword={searchKeyword}
          />
        </Paper>
      </Box>
    </Container>
  );
}
