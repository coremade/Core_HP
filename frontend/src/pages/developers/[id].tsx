import { useRouter } from 'next/router';
import { Container } from '@mui/material';
import { DeveloperDetail } from '@/components/developer/DeveloperDetail';

export default function DeveloperDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== 'string') {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <DeveloperDetail developerId={id} />
    </Container>
  );
} 