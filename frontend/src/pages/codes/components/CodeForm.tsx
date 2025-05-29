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
import { commonCodeApi } from '../../../api/commonCode';
import { MasterCode, CreateMasterCodeDto, UpdateMasterCodeDto } from '../../../types/commonCode';

interface CodeFormProps {
  open: boolean;
  onClose: () => void;
  editingCode: MasterCode | null;
}

const validationSchema = yup.object({
  master_id: yup.string().required('코드 ID는 필수입니다'),
  master_name: yup.string().required('코드명은 필수입니다'),
  description: yup.string(),
});

export default function CodeForm({ open, onClose, editingCode }: CodeFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!editingCode;

  const createMutation = useMutation({
    mutationFn: commonCodeApi.createMasterCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterCodes'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMasterCodeDto }) =>
      commonCodeApi.updateMasterCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterCodes'] });
      onClose();
    },
  });

  const formik = useFormik({
    initialValues: {
      master_id: editingCode?.master_id || '',
      master_name: editingCode?.master_name || '',
      description: editingCode?.description || '',
      use_yn: editingCode?.use_yn || 'Y',
    },
    validationSchema,
    onSubmit: (values) => {
      if (isEditing) {
        updateMutation.mutate({
          id: editingCode.master_id,
          data: {
            master_name: values.master_name,
            description: values.description,
            use_yn: values.use_yn as 'Y' | 'N',
          },
        });
      } else {
        createMutation.mutate({
          master_id: values.master_id,
          master_name: values.master_name,
          description: values.description,
          use_yn: values.use_yn as 'Y' | 'N',
        });
      }
    },
  });

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
              onChange={formik.handleChange}
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
              onChange={formik.handleChange}
              error={formik.touched.master_name && Boolean(formik.errors.master_name)}
              helperText={formik.touched.master_name && formik.errors.master_name}
            />
            <TextField
              fullWidth
              id="description"
              name="description"
              label="설명"
              value={formik.values.description}
              onChange={formik.handleChange}
              multiline
              rows={3}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.use_yn === 'Y'}
                  onChange={(e) =>
                    formik.setFieldValue('use_yn', e.target.checked ? 'Y' : 'N')
                  }
                />
              }
              label="사용 여부"
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