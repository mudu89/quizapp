import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const LightAppBar = styled(AppBar)({
  backgroundColor: '#f5f5f5',
  color: '#000',

});

const Footer: React.FC = () => {
  return (
    <LightAppBar position="fixed" style={{ left: 0, bottom: 0, right: 0, top: 'auto'}}>
      <Toolbar>
        <Typography variant="body1">
          © 2025 Quiz App. All rights reserved.
        </Typography>
      </Toolbar>
    </LightAppBar>
  );
};

export default Footer;