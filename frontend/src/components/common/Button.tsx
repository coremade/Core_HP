import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ButtonProps extends MuiButtonProps {
  fullWidth?: boolean;
}

const StyledButton = styled(MuiButton)<ButtonProps>(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: '8px 16px',
  '&.MuiButton-containedPrimary': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  '&.MuiButton-outlinedPrimary': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
  },
}));

export const Button = ({ children, ...props }: ButtonProps) => {
  return <StyledButton {...props}>{children}</StyledButton>;
}; 