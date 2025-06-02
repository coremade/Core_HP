import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';

interface Developer {
  id: string;
  name: string;
  email: string;
  position: string;
  skills: string[];
  status: string;
  profileImage?: string;
}

interface DeveloperFormDialogProps {
  open: boolean;
  onClose: () => void;
  developer?: Developer | null;
}

const positions = ['주니어 개발자', '시니어 개발자', '테크 리드', '아키텍트'];
const statuses = ['대기중', '프로젝트 진행중', '휴가중'];
const availableSkills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Python',
  'Java',
  'Spring',
  'Docker',
  'Kubernetes',
  'AWS',
];

export default function DeveloperFormDialog({
  open,
  onClose,
  developer,
}: DeveloperFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    skills: [] as string[],
    status: '',
  });

  useEffect(() => {
    if (developer) {
      setFormData({
        name: developer.name,
        email: developer.email,
        position: developer.position,
        skills: developer.skills,
        status: developer.status,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        position: '',
        skills: [],
        status: '대기중',
      });
    }
  }, [developer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save functionality
    console.log('Save developer:', formData);
    onClose();
  };

  const handleSkillChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      skills: typeof value === 'string' ? value.split(',') : value,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {developer ? '개발자 정보 수정' : '새 개발자 등록'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="이름"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              fullWidth
            />
            <TextField
              label="이메일"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>직급</InputLabel>
              <Select
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                label="직급"
              >
                {positions.map((position) => (
                  <MenuItem key={position} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>보유 기술</InputLabel>
              <Select
                multiple
                value={formData.skills}
                onChange={handleSkillChange}
                input={<OutlinedInput label="보유 기술" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {availableSkills.map((skill) => (
                  <MenuItem key={skill} value={skill}>
                    {skill}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>상태</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                label="상태"
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 