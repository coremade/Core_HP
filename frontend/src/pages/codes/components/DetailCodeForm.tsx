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
import { DetailCode, CreateDetailCodeDto, UpdateDetailCodeDto } from '../../../types/commonCode';

interface DetailCodeFormProps {
  open: boolean;
  onClose: () => void;
  masterId: string;
  editingCode: DetailCode | null;
}

const validationSchema = yup.object({
  detail_id: yup.string().required('코드 ID는 필수입니다'),
  detail_name: yup.string().required('코드명은 필수입니다'),
  sort_order: yup.number().min(0, '정렬 순서는 0 이상이어야 합니다'),
  description: yup.string(),
  extra_value1: yup.string(),
  extra_value2: yup.string(),
  extra_value3: yup.string(),
});

export default function DetailCodeForm({
  open,
  onClose,
  masterId,
  editingCode,
}: DetailCodeFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!editingCode;

  const createMutation = useMutation({
    mutationFn: commonCodeApi.createDetailCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detailCodes', masterId] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDetailCodeDto }) =>
      commonCodeApi.updateDetailCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detailCodes', masterId] });
      onClose();
    },
  });

  const formik = useFormik({
    initialValues: {
      detail_id: editingCode?.detail_id || '',
      detail_name: editingCode?.detail_name || '',
      sort_order: editingCode?.sort_order || 0,
      description: editingCode?.description || '',
      use_yn: editingCode?.use_yn || 'Y',
      extra_value1: editingCode?.extra_value1 || '',
      extra_value2: editingCode?.extra_value2 || '',
      extra_value3: editingCode?.extra_value3 || '',
    },
    validationSchema,
    onSubmit: (values) => {
      if (isEditing) {
        updateMutation.mutate({
          id: editingCode.detail_id,
          data: {
            detail_name: values.detail_name,
            sort_order: values.sort_order,
            description: values.description,
            use_yn: values.use_yn as 'Y' | 'N',
            extra_value1: values.extra_value1,
            extra_value2: values.extra_value2,
            extra_value3: values.extra_value3,
          },
        });
      } else {
        createMutation.mutate({
          detail_id: values.detail_id,
          master_id: masterId,
          detail_name: values.detail_name,
          sort_order: values.sort_order,
          description: values.description,
          use_yn: values.use_yn as 'Y' | 'N',
          extra_value1: values.extra_value1,
          extra_value2: values.extra_value2,
          extra_value3: values.extra_value3,
        });
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{isEditing ? '상세 코드 수정' : '새 상세 코드'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              id="detail_id"
              name="detail_id"
              label="코드 ID"
              value={formik.values.detail_id}
              onChange={formik.handleChange}
              error={formik.touched.detail_id && Boolean(formik.errors.detail_id)}
              helperText={formik.touched.detail_id && formik.errors.detail_id}
              disabled={isEditing}
            />
            <TextField
              fullWidth
              id="detail_name"
              name="detail_name"
              label="코드명"
              value={formik.values.detail_name}
              onChange={formik.handleChange}
              error={formik.touched.detail_name && Boolean(formik.errors.detail_name)}
              helperText={formik.touched.detail_name && formik.errors.detail_name}
            />
            <TextField
              fullWidth
              id="sort_order"
              name="sort_order"
              label="정렬 순서"
              type="number"
              value={formik.values.sort_order}
              onChange={formik.handleChange}
              error={formik.touched.sort_order && Boolean(formik.errors.sort_order)}
              helperText={formik.touched.sort_order && formik.errors.sort_order}
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
            <TextField
              fullWidth
              id="extra_value1"
              name="extra_value1"
              label="추가값1"
              value={formik.values.extra_value1}
              onChange={formik.handleChange}
            />
            <TextField
              fullWidth
              id="extra_value2"
              name="extra_value2"
              label="추가값2"
              value={formik.values.extra_value2}
              onChange={formik.handleChange}
            />
            <TextField
              fullWidth
              id="extra_value3"
              name="extra_value3"
              label="추가값3"
              value={formik.values.extra_value3}
              onChange={formik.handleChange}
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