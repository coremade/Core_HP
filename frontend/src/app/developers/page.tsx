'use client';

import { useState } from 'react';
import { Container, Box, Typography, Snackbar, Alert } from '@mui/material';
import DeveloperList from '../../components/developers/DeveloperList';
import DeveloperDetailForm from '../../components/developers/DeveloperDetailForm';
import DeveloperSearchBar from '../../components/developers/DeveloperSearchBar';
import SidebarMenu from '../../components/common/SidebarMenu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { developerService } from '../../services/developerService';
import type { Developer, CreateDeveloperDto } from '../../services/developerService';
import type { SearchFilters } from '../../components/developers/DeveloperSearchBar';

export default function DevelopersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [excludeSkills, setExcludeSkills] = useState('');
  const [skillsCondition, setSkillsCondition] = useState('OR');
  const [excludeSkillsCondition, setExcludeSkillsCondition] = useState('OR');
  const [genders, setGenders] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const queryClient = useQueryClient();

  const handleSearch = (filters: SearchFilters) => {
    setName(filters.name || '');
    setPhone(filters.phone || '');
    setSkills(filters.skills || '');
    setExcludeSkills(filters.excludeSkills || '');
    setSkillsCondition(filters.skillsCondition || 'OR');
    setExcludeSkillsCondition(filters.excludeSkillsCondition || 'OR');
    setGenders(filters.genders || []);
    setGrades(filters.grades || []);
    setPage(1); // Reset to first page on new search
  };

  const { data, isLoading } = useQuery({
    queryKey: ['developers', page, pageSize, name, phone, skills, excludeSkills, skillsCondition, excludeSkillsCondition, genders, grades],
    queryFn: () => developerService.getDevelopers({ 
      page, 
      pageSize, 
      name,
      phone,
      skills,
      excludeSkills,
      skillsCondition,
      excludeSkillsCondition,
      genders, 
      grades 
    }),
  });

  const createMutation = useMutation({
    mutationFn: developerService.createDeveloper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      setIsCreateMode(false);
      setSuccessMessage('개발자가 성공적으로 등록되었습니다.');
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || '개발자 등록 중 오류가 발생했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Developer> }) =>
      developerService.updateDeveloper(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      setSuccessMessage('개발자 정보가 성공적으로 수정되었습니다.');
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || '개발자 정보 수정 중 오류가 발생했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: (string | number)[]) => {
      const stringIds = ids.map(id => id.toString());
      return developerService.deleteDevelopers(stringIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      setSuccessMessage('선택한 개발자가 성공적으로 삭제되었습니다.');
      setSelectedDeveloper(null);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || '개발자 삭제 중 오류가 발생했습니다.');
    },
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleCreateNew = () => {
    setSelectedDeveloper(null);
    setIsCreateMode(true);
  };

  const handleSaveDeveloper = async (developer: Partial<Developer>) => {
    try {
      if (isCreateMode) {
        const newDeveloper: CreateDeveloperDto = {
          developer_name: developer.developer_name || '',
          developer_birth: developer.developer_birth || '',
          developer_sex: developer.developer_sex || '',
          developer_email: developer.developer_email || '',
          developer_phone: developer.developer_phone,
          developer_addr: developer.developer_addr || '',
          developer_profile_image: developer.developer_profile_image,
          developer_start_date: developer.developer_start_date,
          developer_career_start_date: developer.developer_career_start_date,
          developer_current_position: developer.developer_current_position || '',
          developer_grade: developer.developer_grade || '',
          developer_married: developer.developer_married,
          developer_military_start_date: developer.developer_military_start_date,
          developer_military_end_date: developer.developer_military_end_date,
          developer_military_desc: developer.developer_military_desc,
        };
        await createMutation.mutateAsync(newDeveloper);
      } else if (selectedDeveloper) {
        await updateMutation.mutateAsync({
          id: selectedDeveloper.developer_id,
          data: developer,
        });
      }
    } catch (error) {
      // 에러는 mutation의 onError에서 처리됩니다.
      console.error('Error saving developer:', error);
    }
  };

  const handleCancel = () => {
    setIsCreateMode(false);
    setSelectedDeveloper(null);
  };

  const handleDeleteDevelopers = async (ids: (string | number)[]) => {
    try {
      await deleteMutation.mutateAsync(ids);
    } catch (error) {
      console.error('Error deleting developers:', error);
      setErrorMessage('개발자 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <SidebarMenu/>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSuccessMessage('')}
            severity="success"
            sx={{ width: '100%' }}
          >
            {successMessage}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!errorMessage}
          autoHideDuration={6000}
          onClose={() => setErrorMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setErrorMessage('')}
            severity="error"
            sx={{ width: '100%' }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>

        <Typography variant="h4" component="h1" gutterBottom>
          개발자 관리
        </Typography>

        <Box sx={{ mb: 3 }}>
          <DeveloperSearchBar onSearch={handleSearch} />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: '0 0 50%' }}>
          <DeveloperList
            developers={data?.developers || []}
            selectedDeveloperId={selectedDeveloper?.developer_id || null}
            onSelectDeveloper={setSelectedDeveloper}
            onCreateNew={handleCreateNew}
            onDeleteDevelopers={handleDeleteDevelopers}
            page={page}
            pageSize={pageSize}
            totalCount={data?.total || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
          />
        </Box>
        <Box sx={{ flex: '0 0 50%' }}>
          <DeveloperDetailForm
            developer={selectedDeveloper}
            isCreating={isCreateMode}
            onSave={handleSaveDeveloper}
            onCancel={handleCancel}
          />
        </Box>
        </Box>
      </Container>
    </>
  );
}
