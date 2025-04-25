import React, { useEffect, useRef, useState } from 'react';
import { Container, Typography, Grid, Box, Button, List, ListItem, ListItemText, fabClasses } from '@mui/material';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { API_URL, WS_URL } from '../common/config';

interface Answer {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  max_time: number; // Added max_time property
  answers: Answer[];
  is_sent: boolean; // Added is_sent property
}

interface RunSessionProps {
  location: {
    state: {
      userId: number;
      username: string;
      access_code: string; // Updated from session_id to access_code
      maxTime: number; // Added maxTime property
      questions: Question[];
    };
  };
}

const RunSession: React.FC<RunSessionProps> = () => {
  const location = useLocation();
  const { userId, username, access_code, maxTime, questions: initialQuestions } = location.state; // Updated session_id to access_code
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [participants, setParticipants] = useState<string[]>([]); // State to track participants
  const [questions, setQuestions] = useState<Question[]>(initialQuestions); // State to track questions
  const [sessionId, setSessionId] = useState<string | null>(null); // State to track session_id as UUID
  const ws = useRef<WebSocket | null>(null); // Use useRef for WebSocket
  const [isMounted, setIsMounted] = useState(false);
  const [searchParams] = useSearchParams();
  const start = searchParams.get('start'); // Access the "start" query parameter
  const navigate = useNavigate(); // Initialize the navigate function
  const [leaderboard, setLeaderboard] = useState<{ username: string; score: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(maxTime); // State to track the remaining time
  const [isSendDisabled, setIsSendDisabled] = useState<boolean>(false); // State to disable the "Send" button

  const fetchParticipants = async (session_id: string|null) => {
    try {
      console.log('Fetching participants...', access_code, session_id);
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

  const fetchLeaderboard = async (session_id: string | null) => {
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

  useEffect(() => {
    if (!isMounted && questions.length === 0) {
      console.log(location.state)
      const fetchQuestions = async () => {
        console.log('Fetching questions...');
        console.log('userId:', userId);
        console.log('access_code:', access_code); // Updated session_id to access_code
        try {
          const startQuizResponse = await fetch(`${API_URL}/quiz?user_id=${userId}&access_code=${access_code}&type=start`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });

          if (startQuizResponse.status === 200) {
            const responseData = await startQuizResponse.json();
            console.log('Quiz started with session_id:', responseData.session_id);
            setSessionId(responseData.session_id); // Set session_id from the response
            
          } else {
            console.error('Failed to start quiz');
            alert('Failed to start quiz');
          }

          const response = await fetch(`${API_URL}/questions?user_id=${userId}&access_code=${access_code}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });

          if (response.status === 200) {
            const data = await response.json();
            const updatedQuestions = data.map((question: Question) => ({
              ...question,
              is_sent: false, // Add is_sent property with default value false
            }));
            setQuestions(updatedQuestions); // Set the fetched questions to the state
            
            console.log('Fetched questions:', updatedQuestions);
          } else {
            console.error('Failed to fetch questions');
          }
        } catch (error) {
          console.error('Error fetching questions:', error);
        }
      };

      fetchQuestions();
    }

    setIsMounted(true);
  }, []); // Updated session_id to access_code

  useEffect(() => {
    if (isMounted) {
      // console.log('Session ID:', sessionId);
      ws.current = new WebSocket(`${WS_URL}`);

      ws.current.onopen = () => {
        console.log('WebSocket connection opened');
        ws.current?.send(
          JSON.stringify({
            action: 'start',
            session_id: access_code, // Updated session_id to access_code
            data: null,
          })
        );
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Message from server:', message);

        if (message.action === 'joined') {
          console.log(sessionId)
          const updateParticipants = async () => {
            const participantsList = await fetchParticipants(sessionId); // Updated session_id to access_code
            setParticipants(participantsList);
          };

          updateParticipants();
        }

        if (message.action === 'left') {
          const updateParticipants = async () => {
            const participantsList = await fetchParticipants(sessionId); // Updated session_id to access_code
            setParticipants(participantsList);
          };

          updateParticipants();
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket connection closed');
        // const handleclose = async () => {
        //   console.log('WebSocket connection closed');
        //   try {
        //         const response = await fetch(`${API_URL}/quiz?user_id=${userId}&access_code=${access_code}&type=end`, {
        //           method: 'PUT',
        //           headers: {
        //             'Content-Type': 'application/json',
        //             'Accept': 'application/json',
        //             'Access-Control-Allow-Origin': '*',
        //           },
        //         });
          
        //         if (response.status === 200) {
        //           console.log('Quiz ended successfully');
        //           // Navigate to HostPage with login state
        //           navigate('/host', { state: { isLogin: true, username, userId } });
        //         } else {
        //           console.error('Failed to end quiz');
        //           alert('Failed to end quiz');
        //         }
        //       } catch (error) {
        //         console.error('Error ending quiz:', error);
        //       }
        // }
        // handleclose();
        
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.error('WebSocket readyState:', ws.current?.readyState);
      };

      return () => {
        ws.current?.close(1000, 'Client closing connection');
      };
    }
  }, [isMounted, access_code, sessionId]); // Updated session_id to access_code

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      const nextQuestion = questions[currentQuestionIndex + 1];
      setIsSendDisabled(nextQuestion.is_sent); 
      setTimeLeft(maxTime);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const previousQuestion = questions[currentQuestionIndex - 1];
      setIsSendDisabled(previousQuestion.is_sent);
      setTimeLeft(maxTime);
    }
  };

  const handleSend = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const currentQuestion = questions[currentQuestionIndex];
      currentQuestion.max_time = maxTime; // Add max_time to the current question
      currentQuestion.is_sent = true; // Mark the question as sent
      ws.current.send(
        JSON.stringify({
          action: 'question',
          session_id: access_code, // Updated session_id to access_code
          data: currentQuestion,
        })
      );
  
      console.log('Sent question:', currentQuestion);
  
      // Start the timer
      setTimeLeft(currentQuestion.max_time);
      setIsSendDisabled(currentQuestion.is_sent); // Disable the "Send" button
    } else {
      console.error('WebSocket is not open');
    }
  };

  const requestCalculate = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          action: 'calculate',
          session_id: access_code, // Updated session_id to access_code
          data: {'session_id': sessionId}, // Send session_id to calculate scores
        })
      );
  
      console.log('Sent Calculate');
  
    } else {
      console.error('WebSocket is not open');
    }
  };

  const requestLeaderboard = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          action: 'leaderboard',
          session_id: access_code, // Updated session_id to access_code
          data: {'session_id': sessionId}, // Send session_id to calculate scores
        })
      );
  
      console.log('Sent Leaderboard Request:');
  
    } else {
      console.error('WebSocket is not open');
    }
  };
  
  useEffect(() => {
    if (isSendDisabled && timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prevTime) => (prevTime !== null ? prevTime - 1 : null));
      }, 1000);
  
      return () => clearTimeout(timer); // Cleanup the timer
    }
  
    if (timeLeft === 0) {
      console.log('Time is up!');
      setTimeLeft(null); // Reset the timer
      //setIsSendDisabled(false); // Re-enable the "Send" button for the next question
      requestCalculate(); // Send the request to calculate scores
      requestLeaderboard(); // Send the request to fetch leaderboard
      fetchLeaderboard(sessionId); // Update the leaderboard when the timer ends
    }
  }, [timeLeft, sessionId, isSendDisabled]);

  const handleEndQuiz = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          action: "end",
          session_id: access_code, // Updated session_id to access_code
          data: {"message": "Quiz Ended"},
        })
      );
      console.log('Ending quiz...');
      ws.current.close(1000, 'Client closing connection');
    }

    const handleclose = async () => {
      console.log('WebSocket connection closed');
      try {
            const response = await fetch(`${API_URL}/quiz?user_id=${userId}&access_code=${access_code}&type=end`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });
      
            if (response.status === 200) {
              console.log('Quiz ended successfully');
              // Navigate to HostPage with login state
              navigate('/host', { state: { isLogin: true, username, userId } });
            } else {
              console.error('Failed to end quiz');
              alert('Failed to end quiz');
            }
          } catch (error) {
            console.error('Error ending quiz:', error);
          }
    }
    handleclose();
  
    // Wait for WebSocket to close before calling the API
    // ws.current?.addEventListener('close', async () => {
    //   try {
    //     const response = await fetch(`${API_URL}/quiz?user_id=${userId}&access_code=${access_code}&type=end`, {
    //       method: 'PUT',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json',
    //         'Access-Control-Allow-Origin': '*',
    //       },
    //     });
  
    //     if (response.status === 200) {
    //       console.log('Quiz ended successfully');
    //       // Navigate to HostPage with login state
    //       navigate('/host', { state: { isLogin: true, username, userId } });
    //     } else {
    //       console.error('Failed to end quiz');
    //       alert('Failed to end quiz');
    //     }
    //   } catch (error) {
    //     console.error('Error ending quiz:', error);
    //   }
    // });
  };
  
  const currentQuestion = questions[currentQuestionIndex];

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
          Running Session for {username}
        </Typography>
        <Typography variant="h6" gutterBottom>
          <Button variant="contained" color="primary" onClick={handleEndQuiz} >
            End Quiz
          </Button>
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {currentQuestion && (
            <Grid item xs={12} sm={8} md={6}>
              <Box
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '1rem',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography variant="h6">
                  {currentQuestion.id}. {currentQuestion.question}
                </Typography>
                <ul>
                  {currentQuestion.answers.map((answer, index) => (
                    <li key={index}>
                      <Typography variant="body2">{answer.text}</Typography>
                    </li>
                  ))}
                </ul>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1rem">
              <AccessTimeIcon fontSize="small" style={{ marginRight: '0.25rem' }} />
                <Typography variant="h6" color={timeLeft && timeLeft <= 5 ? 'error' : 'text.primary'}>
                  {timeLeft !== null ? `${timeLeft} sec` : 'Time is up!'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" width="100%" marginTop="1rem">
                <Box display="flex" justifyContent="flex-start" flex="1">
                  <Button variant="contained" color="primary" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                    Previous
                  </Button>
                </Box>
                <Box display="flex" justifyContent="center" flex="1">
                  <Button variant="contained" color="secondary" onClick={handleSend} disabled={isSendDisabled}>
                    Send
                  </Button>
                </Box>
                <Box display="flex" justifyContent="flex-end" flex="1">
                  <Button variant="contained" color="primary" onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>
                    Next
                  </Button>
                </Box>
              </Box>
            </Grid>
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

export default RunSession;