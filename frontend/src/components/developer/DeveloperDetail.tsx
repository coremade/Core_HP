import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import { Button } from '@/components/common/Button';
import { Developer } from '@/types/developer';
import { developerApi } from '@/api/developer';

export const DeveloperDetail = ({ developerId }: { developerId: string }) => {
  const router = useRouter();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeveloper = async () => {
      try {
        setLoading(true);
        const data = await developerApi.getDeveloperById(developerId);
        setDeveloper(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '개발자 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (developerId) {
      fetchDeveloper();
    }
  }, [developerId]);

  const handleEdit = () => {
    router.push(`/developers/edit/${developerId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 개발자를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await developerApi.deleteDeveloper(developerId);
      router.push('/developers');
    } catch (err) {
      setError(err instanceof Error ? err.message : '개발자 삭제에 실패했습니다.');
    }
  };

  if (loading) return <Typography>로딩 중...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!developer) return <Typography>개발자를 찾을 수 없습니다.</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">개발자 상세 정보</Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleEdit}
            style={{ marginRight: 8 }}
          >
            수정
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
          >
            삭제
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} display="flex" justifyContent="center">
              <Avatar
                src={developer.developer_profile_image || '/default-avatar.png'}
                sx={{ width: 200, height: 200 }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h6">{developer.developer_name}</Typography>
              <Typography color="textSecondary" gutterBottom>
                {developer.developer_email}
              </Typography>
              <Box mt={2}>
                <Typography><strong>직급:</strong> {developer.developer_current_position || '-'}</Typography>
                <Typography><strong>등급:</strong> {developer.developer_grade || '-'}</Typography>
                <Typography><strong>연락처:</strong> {developer.developer_phone || '-'}</Typography>
                <Typography><strong>주소:</strong> {developer.developer_addr || '-'}</Typography>
                <Typography>
                  <strong>입사일:</strong> {' '}
                  {developer.developer_start_date
                    ? new Date(developer.developer_start_date).toLocaleDateString()
                    : '-'}
                </Typography>
                <Typography>
                  <strong>경력 시작일:</strong> {' '}
                  {developer.developer_career_start_date
                    ? new Date(developer.developer_career_start_date).toLocaleDateString()
                    : '-'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}; 