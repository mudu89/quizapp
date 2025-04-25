import React, { Component } from 'react';
import { Card, CardContent, TextField, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import PrimaryButton from '../common/PrimaryButton';
import { useNavigate } from 'react-router-dom';
import Signup from './Signup';
import { API_URL } from '../common/config';

interface LoginProps {
  navigate: any;
}

interface LoginState {
  email: string;
  username: string;
  password: string;
  isLogin: boolean;
  isSignupOpen: boolean;
  userId: number;
}

class Login extends Component<LoginProps, LoginState> {
  constructor(props: any) {
    super(props);

    this.state = {
      email: '',
      username: '',
      password: '',
      isLogin: false,
      isSignupOpen: false,
      userId: 0,
    };
  }

  handleSubmit = async (event: React.FormEvent<Element>) => {
    event.preventDefault();
    const { email, password, userId, username } = this.state;

    try {
      console.log(`${API_URL}`)
      const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ email: email, password: password }),
      });
      if (response.status === 200) {
        const data = await response.json();
        console.log(data);
        this.setState({ isLogin: true, userId: data.id, username: data.name }, () => {
          this.props.navigate('/host', { state: { isLogin: this.state.isLogin, username: this.state.username, userId: this.state.userId } });
        });
      } else {
        this.setState({ username: '', password: '', isLogin: false });
        alert('Invalid username or password');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  handleSignupOpen = () => {
    this.setState({ isSignupOpen: true });
  };

  handleSignupClose = () => {
    this.setState({ isSignupOpen: false });
  };

  render() {
    const { email, password, isSignupOpen } = this.state;
    const isFormValid = email && password;

    return (
      <>
        <Box
          id="login-box"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%', // Ensure it fills the parent box height
            width: '100%', // Ensure it fills the parent box width
          }}
        >
          <Card
            id="login-card"
            style={{
              width: '90%', // Adjust width to fit within the parent box
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardContent>
              <h5 style={{ textAlign: 'center' }}>Login</h5>
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={this.handleSubmit}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <TextField
                  id="email"
                  label="Email"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={email}
                  onChange={(e) => this.setState({ email: e.target.value })}
                />
                <TextField
                  id="password"
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={password}
                  onChange={(e) => this.setState({ password: e.target.value })}
                />
                <Box display="flex" justifyContent="space-between">
                  <PrimaryButton id="submit-button" size="small" type="submit" disabled={!isFormValid}>
                    Submit
                  </PrimaryButton>
                  <PrimaryButton id="signup-button" size="small" type="button" onClick={this.handleSignupOpen}>
                    Sign Up
                  </PrimaryButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Dialog open={isSignupOpen} onClose={this.handleSignupClose}>
          <DialogTitle>Sign Up</DialogTitle>
          <DialogContent>
            <Signup />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleSignupClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

const LoginWithNavigate = (props: any) => {
  const navigate = useNavigate();
  return <Login {...props} navigate={navigate} />;
};

export default LoginWithNavigate;
