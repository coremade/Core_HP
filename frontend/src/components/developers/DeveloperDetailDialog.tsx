import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  CircularProgress,
  Typography
} from '@mui/material';
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Developer } from '../../services/developerService';
import DeveloperDetailForm from './DeveloperDetailForm';

interface DeveloperDetailDialogProps {
  open: boolean;
  onClose: () => void;
  developerId: number | null;
  allowEdit?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

export default function DeveloperDetailDialog({
  open,
  onClose,
  developerId,
  allowEdit = false
}: DeveloperDetailDialogProps) {
  const [readonly, setReadonly] = useState(true);
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 개발자 정보 로드
  const loadDeveloper = useCallback(async () => {
    if (!developerId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/developers/${developerId}`);
      setDeveloper(response.data);
    } catch (error) {
      console.error('개발자 정보 로드 중 오류:', error);
      setError('개발자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [developerId]);

  // 팝업이 열릴 때 개발자 정보 로드
  useEffect(() => {
    if (open && developerId) {
      loadDeveloper();
      setReadonly(true); // 팝업 열릴 때마다 readonly 모드로 초기화
    }
  }, [open, developerId, loadDeveloper]);

  const handleSave = useCallback(async (updatedDeveloper: Partial<Developer>) => {
    if (!developerId) return;

    try {
      await axios.put(`${API_BASE_URL}/developers/${developerId}`, updatedDeveloper);
      console.log('개발자 정보 저장 완료');
      setReadonly(true);
      // 저장 후 데이터 새로고침
      loadDeveloper();
    } catch (error) {
      console.error('개발자 정보 저장 중 오류:', error);
    }
  }, [developerId, loadDeveloper]);

  const handleCancel = useCallback(() => {
    setReadonly(true);
  }, []);

  const handleClose = useCallback(() => {
    setReadonly(true);
    setDeveloper(null);
    setError('');
    onClose();
  }, [onClose]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    if (!developer) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Typography>개발자 정보가 없습니다.</Typography>
        </Box>
      );
    }

    return (
      <DeveloperDetailForm
        developer={developer}
        readonly={readonly}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      {allowEdit && developer && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <FormControlLabel
            control={
              <Switch
                checked={!readonly}
                onChange={(e) => setReadonly(!e.target.checked)}
              />
            }
            label="수정 모드"
          />
        </Box>
      )}
      <DialogContent sx={{ p: 0, height: '80vh' }}>
        {renderContent()}
      </DialogContent>
      <DialogActions sx={{ px: 2, justifyContent: 'flex-end' }}>
        <Button onClick={handleClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
} 