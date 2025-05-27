import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface InputProps extends TextFieldProps {
  error?: boolean;
  helperText?: string;
}

const StyledTextField = styled(TextField)<InputProps>(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    '& fieldset': {
      borderColor: theme.palette.grey[300],
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
}));

export const Input = (props: InputProps) => {
  return <StyledTextField {...props} />;
}; 