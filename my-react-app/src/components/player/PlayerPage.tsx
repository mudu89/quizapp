import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Typography, Box, List, ListItem, ListItemText, Radio, RadioGroup, FormControlLabel, Button } from '@mui/material';
import QuestionCard from '../host/QuestionCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { API_URL, WS_URL } from '../common/config';

interface Answer {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  max_time: number;
  answers: Answer[];
}

const PlayerPage: React.FC = () => {
  const { access_code, player_name, session_id } = useParams<{ access_code: string; player_name: string, session_id: string }>();
  const [isMounted, setIsMounted] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [submittedTime, setSubmittedTime] = useState<number | null>(null);
  const [placeholderMsg, setPlaceholderMsg] = useState<string>('Waiting for the next question...');
  const [leaderboard, setLeaderboard] = useState<{ username: string; score: number }[]>([]);
  const ws = useRef<WebSocket | null>(null);

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`${API_URL}/players?access_code=${access_code}&session_id=${session_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log('Fetched participants:', data);
        return data.usernames; // Return the list of usernames
      } else {
        console.error('Failed to fetch participants');
        return [];
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  };

  const fetchLeaderboard = async () => {
    try {
      console.log('Fetching leaderboard...', access_code, session_id);
      const response = await fetch(`${API_URL}/leaderboard/?session_id=${session_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log('Fetched leaderboard:', data);
        setLeaderboard(data); // Update the leaderboard state
      } else {
        console.error('Failed to fetch leaderboard');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchPlayerScore = async (player_id: number | null) => {
    try {
      const response = await fetch(`${API_URL}/player?player_id=${player_id}&session_id=${session_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log('Fetched participants:', data);
        return data.score; // Return the list of usernames
      } else {
        console.error('Failed to fetch participants');
        return [];
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  };

  useEffect(() => {
    console.log(isMounted);
    if (!isMounted) {
      console.log('Component mounted, creating player...');
      const createPlayer = async () => {
        try {
          const response = await fetch(`${API_URL}/player/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
              username: player_name,
              access_code: access_code,
              session_id: session_id
            }),
          });

          if (response.status === 200) {
            const data = await response.json();
            console.log('Player created successfully:', data);
            setPlayerId(data.id); // Set the player ID
            setIsMounted(true);
          } else {
            console.error('Failed to create player');
            alert('Join failed due to error. Please try again.');
          }
        } catch (error) {
          console.error('Error creating player:', error);
          alert('Join failed due to error. Please try again.');
        }
      };

      createPlayer();

    }
    if (isMounted) {
      ws.current = new WebSocket(`${WS_URL}`);

      ws.current.onopen = () => {
        console.log('WebSocket connection opened');
        ws.current?.send(
          JSON.stringify({
            action: 'join',
            session_id: access_code,
            data: { username: player_name },
          })
        );
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Message from server:', message);

        if (message.action === 'joined') {
          console.log('Message action:', message.action);
          const updateParticipants = async () => {
            const participantsList = await fetchParticipants(); // Updated session_id to access_code
            setParticipants(participantsList);
            //setParticipants((prevParticipants) => [...prevParticipants, message.data.username]);
          }
          updateParticipants();
        }

        if (message.action === 'left') {
          const updateParticipants = async () => {
            const participantsList = await fetchParticipants(); // Updated session_id to access_code
            setParticipants(participantsList);

            //setParticipants((prevParticipants) => [...prevParticipants, message.data.username]);
          }
          updateParticipants();
        }

        if (message.action === 'question') {
          setCurrentQuestion(message.data);
          setSelectedAnswer(null);
          setIsSubmitDisabled(false); // Enable the button when a new question is received
          setSubmittedTime(null); // Reset the submitted time when a new question is received

          const correct = message.data.answers.find((answer: Answer) => answer.isCorrect);
          if (correct) {
            setCorrectAnswer(correct.text);
          } else {
            setCorrectAnswer(null);
          }

          // Start the timer in milliseconds
          setTimeLeft(message.data.max_time * 1000); // Convert seconds to milliseconds
        }

        if (message.action === 'end') {
          const status = message.data.message;
          console.log('Status:', status);
          if (status === 'Quiz Ended') {
            const updatePlaceholder = async () => {
              try {
                const playerScore = await fetchPlayerScore(playerId);
                console.log('Player score:', playerScore); // Log the player's score
                setCurrentQuestion(null); // Clear the current question
                setPlaceholderMsg(`Thank you for participating in Quiz. \n Your score is: ${playerScore}`);

              } catch (error) {
                console.error('Error fetching player score:', error);
              }
            };
            updatePlaceholder();
          } else {
            setCurrentQuestion(null); // Clear the current question
            setPlaceholderMsg(`Quiz is not active. \n Please try again later.`);
          }

        }

        if (message.action === 'leaderboard') {
          console.log('Leaderboard data:', message.data);
          fetchLeaderboard();
        }
        
      };

      ws.current.onclose = () => {
        console.log('WebSocket connection closed');
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        ws.current?.close(1000, 'Client closing connection');
      };
    }
  }, [isMounted, access_code, player_name]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prevTime) => (prevTime !== null ? prevTime - 100 : null)); // Decrement by 100ms
      }, 100); // Update every 100ms

      return () => clearTimeout(timer); // Cleanup the timer
    }

    if (timeLeft === 0) {
      console.log('Time is up!');
      setIsSubmitDisabled(true);
      
    }
    if (timeLeft === null && isSubmitDisabled) {
      console.log('Answer submitted, Fetching leaderboard...');
    }
  }, [timeLeft]);

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAnswer(event.target.value);
  };

  const handleSubmitAnswer = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && currentQuestion) {
      const isAnswered = selectedAnswer === correctAnswer ? "yes" : "no";
      const timeTaken = currentQuestion.max_time * 1000 - (timeLeft ?? 0); // Calculate time taken in milliseconds
  
      ws.current.send(
        JSON.stringify({
          action: 'answer',
          session_id: access_code,
          data: {
            username: player_name,
            session_id: session_id,
            user_id: playerId,
            question: currentQuestion.id,
            isAnswered: isAnswered,
            maxTime: currentQuestion.max_time * 1000, // Send maxTime in milliseconds
            timeTaken: timeTaken, // Include time taken in milliseconds
          },
        })
      );
  
      console.log(`Time taken to answer: ${timeTaken} milliseconds`);
      setIsSubmitDisabled(true); // Disable the button after submission
      setSubmittedTime(timeTaken); // Store the time taken when the button was clicked
      setTimeLeft(null); // Stop the timer
    } else {
      console.error('WebSocket is not open or no question is available');
    }
  };
  

  return (
    <Container maxWidth={false} style={{ display: 'flex', flexDirection: 'row', padding: '2rem' }}>
      {/* Sidebar */}
      <Box
        style={{
          width: '250px',
          marginRight: '2rem',
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          height: '75vh',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Participants: {participants.length}
        </Typography>
        <List>
          {participants.map((participant, index) => (
            <ListItem key={index}>
              <ListItemText primary={participant} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Content */}
      <Box style={{ flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          Player: {player_name}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Access Code: {access_code}
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {currentQuestion ? (
            <Grid item xs={12} sm={8} md={6}>
              <Box
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '1rem',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">
                    {currentQuestion.id}. {currentQuestion.question}
                  </Typography>
                  <Box display="flex" alignItems="center" marginLeft="1rem">
                    <AccessTimeIcon fontSize="small" style={{ marginRight: '0.25rem' }} />
                    <Typography variant="h6" color={timeLeft && timeLeft <= 5 ? 'error' : 'text.primary'}>
                      {timeLeft !== null ? `${(timeLeft / 1000).toFixed(1)} sec` : submittedTime !== null ? `${(submittedTime / 1000).toFixed(1)} sec` : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                <RadioGroup value={selectedAnswer} onChange={handleAnswerChange}>
                  {currentQuestion.answers.map((answer, index) => (
                    <FormControlLabel
                      key={index}
                      value={answer.text}
                      control={<Radio />}
                      label={answer.text}
                    />
                  ))}
                </RadioGroup>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || timeLeft === 0 || isSubmitDisabled} // Disable if no answer is selected, time is up, or button is already clicked
                  style={{ marginTop: '1rem' }}
                >
                  Submit Answer
                </Button>
              </Box>
            </Grid>
          ) : (
            <Typography
              id="place-holder-msg"
              variant="body2"
              color="text.secondary"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontSize: '1.5rem', // Increase font size
                height: '100%', // Ensure it takes full height of the container
              }}
            >
              {placeholderMsg}
            </Typography>
          )}
        </Grid>
      </Box>

      <Box
        style={{
          width: '250px',
          marginRight: '2rem',
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          height: '75vh',
        }}
      >
        <Typography variant="h6" gutterBottom>
          LeaderBoard
        </Typography>
        <List>
          {leaderboard.map((entry, index) => (
            <ListItem key={index}>
              <ListItemText primary={`${entry.username.toUpperCase()}  ${entry.score}`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default PlayerPage;