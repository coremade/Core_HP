import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Developer {
  id: string;
  name: string;
  email: string;
  position: string;
  skills: string[];
  status: string;
  profileImage?: string;
}

interface DeveloperTableProps {
  searchKeyword: string;
  onEditDeveloper: (developer: Developer) => void;
}

// 임시 데이터
const mockDevelopers: Developer[] = [
  {
    id: '1',
    name: '홍길동',
    email: 'hong@example.com',
    position: '시니어 개발자',
    skills: ['React', 'Node.js'],
    status: '프로젝트 진행중',
  },
  {
    id: '2',
    name: '김철수',
    email: 'kim@example.com',
    position: '주니어 개발자',
    skills: ['JavaScript', 'Python'],
    status: '대기중',
  },
];

export default function DeveloperTable({ searchKeyword, onEditDeveloper }: DeveloperTableProps) {
  const handleDelete = (developerId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete developer:', developerId);
  };

  const filteredDevelopers = mockDevelopers.filter((developer) => {
    const searchLower = searchKeyword.toLowerCase();
    return (
      developer.name.toLowerCase().includes(searchLower) ||
      developer.email.toLowerCase().includes(searchLower) ||
      developer.position.toLowerCase().includes(searchLower) ||
      developer.skills.some((skill) => skill.toLowerCase().includes(searchLower))
    );
  });

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>이름</TableCell>
            <TableCell>직급</TableCell>
            <TableCell>주요 기술</TableCell>
            <TableCell>상태</TableCell>
            <TableCell align="right">작업</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredDevelopers.map((developer) => (
            <TableRow key={developer.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src={developer.profileImage}
                    alt={developer.name}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  >
                    {developer.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body1">{developer.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {developer.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{developer.position}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {developer.skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={developer.status}
                  size="small"
                  color={developer.status === '프로젝트 진행중' ? 'success' : 'warning'}
                />
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => onEditDeveloper(developer)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(developer.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 