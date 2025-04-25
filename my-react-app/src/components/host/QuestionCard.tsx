import React from 'react';
import { Card, CardContent } from '@mui/material';

interface QuestionCardProps {
  children: React.ReactNode;
  width?: any | "100%";
  height?: any | "auto";
}

const QuestionCard: React.FC<QuestionCardProps> = ({ children, width, height }) => {
  return (
    <Card sx={{ width: { xs: {width}, sm: 300 }, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', alignItems: 'stretch', height: {height}, justifyContent: 'center' }}>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;