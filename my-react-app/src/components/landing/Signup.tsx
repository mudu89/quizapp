import React, { useState } from 'react';
import { Card, CardContent, TextField, Box, Button } from '@mui/material';
import PrimaryButton from '../common/PrimaryButton';
import { API_URL } from '../common/config';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ email: email, password: password, name: username }),
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log('Signup successful:', data);
        alert('Signup successful! You can now log in.');
      } else {
        alert('Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <Card
        id="signup-card"
        style={{
          maxWidth: 250,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          alignItems: 'stretch'
        }}
      >
        <CardContent>
          <h5>Signup Page</h5>
          <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleSignup}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <TextField
              id="username"
              label="Username"
              variant="outlined"
              fullWidth
              size="small"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              id="email"
              label="Email"
              variant="outlined"
              fullWidth
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              id="signup-submit-button"
              variant="contained"
              color="primary"
              type="submit"
              disabled={!email || !password || !username}
            >
              Sign Up
            </Button>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default Signup;