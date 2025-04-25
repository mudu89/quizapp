import React from 'react';
import { Box, Container, Divider, Grid } from '@mui/material';
import LoginWithNavigate from './Login';
import Join from './Join';

const MainPage: React.FC = () => {
  return (
    <Container
      id="main-container"
      maxWidth={false}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Ensure the container takes the full height of the viewport
        padding: '2rem',
      }}
    >
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={2}
        style={{
          maxWidth: '800px', // Limit the width of the content
        }}
      >
        {/* Join Section */}
        <Grid item xs={12} sm={5}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            style={{
              height: '200px', // Fixed height for both boxes
              backgroundColor: 'rgba(240, 240, 240, 0.9)', // Light background color
              borderRadius: '8px', // Rounded corners
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow
            }}
          > 
            <Join />
          </Box>
        </Grid>

        {/* Divider */}
        <Grid item xs={12} sm={2}>
          <Divider
            orientation="vertical"
            flexItem
            style={{
              height: '200px', // Match the height of the boxes
              borderColor: 'black',
            }}
          />
        </Grid>

        {/* Login Section */}
        <Grid item xs={12} sm={5}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            style={{
              height: '200px', // Fixed height for both boxes
              backgroundColor: 'rgba(240, 240, 240, 0.9)', // Light background color
              borderRadius: '8px', // Rounded corners
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow
            }}
          >
            <LoginWithNavigate />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MainPage;