import React, { useState } from 'react';
import { Card, CardContent, TextField, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import PrimaryButton from '../common/PrimaryButton';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../common/config';

const Join: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [quizCode, setQuizCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null); // State for session_id
  const navigate = useNavigate();

  const handleJoinClick = async () => {
    try {
      // Fetch the session_id for the given quizCode
      const response = await fetch(`${API_URL}/quiz/session/?access_code=${quizCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        setSessionId(data.session_id); // Set the session_id if found
        console.log('Active session found:', data.session_id);
        setOpen(true); // Open the dialog to enter player name
      } else {
        console.error('No active session found for the given quiz code');
        alert('The quiz session is not active. Please try again later.');
      }
    } catch (error) {
      console.error('Error checking session status:', error);
      alert('An error occurred while checking the session status. Please try again.');
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    if (sessionId) {
      // Navigate to the player page with session_id and playerName
      navigate(`/player/${quizCode}/${playerName}/${sessionId}`);
    } else {
      alert('Session ID is missing. Please try again.');
    }
  };

  return (
    <>
      <Card
        id="join-card"
        style={{
          width: 400,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          alignItems: 'stretch',
          justifyContent: 'center',
        }}
      >
        <CardContent style={{ textAlign: 'left', alignItems: 'center', color: 'sky' }}>
          <h5>Join Quiz</h5>
          <Box component="form" noValidate autoComplete="off">
            <TextField
              id="join-quiz"
              label="Enter the Code"
              variant="outlined"
              fullWidth
              margin="normal"
              size="small"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value)}
            />
            <Box display="flex" justifyContent="flex-start" marginTop="1rem">
              <PrimaryButton id="join-button" size="small" onClick={handleJoinClick} disabled={!quizCode}>
                Join
              </PrimaryButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enter Player Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="player-name"
            label="Player Name"
            type="text"
            fullWidth
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" disabled={!playerName}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Join;