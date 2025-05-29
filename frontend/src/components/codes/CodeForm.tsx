import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commonCodeApi } from '../../api/commonCode';
import { MasterCode, CreateMasterCodeDto, UpdateMasterCodeDto } from '../../types/commonCode';
import { useEffect } from 'react';

interface CodeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (code: MasterCode) => void;
  editingCode: MasterCode | null;
  initialValues?: {
    master_id: string;
    master_name: string;
    description: string;
    use_yn: 'Y' | 'N';
  };
}

const validationSchema = yup.object({
  master_id: yup
    .string()
    .required('코드 ID는 필수입니다')
    .matches(/^[A-Z]+$/, '코드 ID는 대문자 영문만 입력 가능합니다.'),
  master_name: yup
    .string()
    .required('코드명은 필수입니다')
    .matches(/^[가-힣a-zA-Z0-9\s]+$/, '코드명은 한글, 영문, 숫자만 입력 가능합니다.'),
  description: yup
    .string()
    .matches(/^[가-힣a-zA-Z0-9\s]*$/, '설명은 한글, 영문, 숫자만 입력 가능합니다.'),
});

export default function CodeForm({ open, onClose, onSubmit, editingCode, initialValues }: CodeFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!editingCode;

  const createMutation = useMutation({
    mutationFn: commonCodeApi.createMasterCode,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['masterCodes'] });
      if (onSubmit) {
        onSubmit(data);
      } else {
        onClose();
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMasterCodeDto }) =>
      commonCodeApi.updateMasterCode(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['masterCodes'] });
      if (onSubmit) {
        onSubmit(data);
      } else {
        onClose();
      }
    },
  });

  const formik = useFormik<CreateMasterCodeDto>({
    initialValues: initialValues || {
      master_id: editingCode?.master_id || '',
      master_name: editingCode?.master_name || '',
      description: editingCode?.description || '',
    },
    validationSchema,
    onSubmit: (values) => {
      if (isEditing) {
        updateMutation.mutate({
          id: editingCode.master_id,
          data: {
            master_name: values.master_name,
            description: values.description,
          },
        });
      } else {
        createMutation.mutate({
          master_id: values.master_id,
          master_name: values.master_name,
          description: values.description,
        });
      }
    },
  });

  useEffect(() => {
    if (initialValues) {
      formik.setValues(initialValues);
    }
  }, [initialValues]);

  const handleMasterIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 대문자 영문만 허용
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    formik.setFieldValue('master_id', value);
  };

  const handleMasterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 한글, 영문, 숫자, 공백만 허용
    const value = e.target.value.replace(/[^가-힣a-zA-Z0-9\s]/g, '');
    formik.setFieldValue('master_name', value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 한글, 영문, 숫자, 공백만 허용
    const value = e.target.value.replace(/[^가-힣a-zA-Z0-9\s]/g, '');
    formik.setFieldValue('description', value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{isEditing ? '마스터 코드 수정' : '새 마스터 코드'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              id="master_id"
              name="master_id"
              label="코드 ID"
              value={formik.values.master_id}
              onChange={handleMasterIdChange}
              error={formik.touched.master_id && Boolean(formik.errors.master_id)}
              helperText={formik.touched.master_id && formik.errors.master_id}
              disabled={isEditing}
            />
            <TextField
              fullWidth
              id="master_name"
              name="master_name"
              label="코드명"
              value={formik.values.master_name}
              onChange={handleMasterNameChange}
              error={formik.touched.master_name && Boolean(formik.errors.master_name)}
              helperText={formik.touched.master_name && formik.errors.master_name}
            />
            <TextField
              fullWidth
              id="description"
              name="description"
              label="설명"
              value={formik.values.description}
              onChange={handleDescriptionChange}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEditing ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 