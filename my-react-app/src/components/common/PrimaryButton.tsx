import React from 'react';
import Button from '@mui/material/Button';

interface PrimaryButtonProps {
  children: React.ReactNode;
  id?: string;
  size: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
  style?: React.CSSProperties;
  onClick?: (event: any) => any;
  type?: 'submit' | 'reset' | 'button';
  disabled?: boolean | false;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, id, size, color, style, onClick, type, disabled}) => {
  return (
    <Button id={id} variant="contained" color={color} size={size} type={type} style={style} onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
};

export default PrimaryButton;