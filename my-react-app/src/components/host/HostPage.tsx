import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Container, Typography, Grid, Box, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, List } from '@mui/material';
import QuestionCard from './QuestionCard';
import PrimaryButton from '../common/PrimaryButton';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { API_URL } from '../common/config';

interface HostPageProps {
  location: {
    state: {
      isLogin: boolean;
      username: string;
      userId: number;
    };
  };
}

interface Question {
  id: number;
  name: string;
  access_code: string;
  is_active: string;
  max_time: number; // Add max_time property
}

const HostPage: React.FC<HostPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session_id } = useParams<{ session_id: string }>();

  const [isLogin, setIsLogin] = useState<boolean>(location.state?.isLogin || false);
  const [username, setUsername] = useState<string>(location.state?.username || '');
  const [userId, setUserId] = useState<number>(location.state?.userId || 0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [quizName, setQuizName] = useState<string>('');
  const [maxTime, setMaxTime] = useState<number>(10); // Default to 10 seconds
  const [ismounted, setIsMounted] = useState<boolean>(false);
  
  useEffect(() => {
    if (!isLogin) {
      alert('Please login to access this page');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_URL}/quiz?user_id=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });

        if (response.status === 200) {
          const data = await response.json();
          console.log(data);
          setQuestions(data);
        } else {
          console.error('Failed to fetch questions');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if(!ismounted) {
      console.log('Componet mount status:', ismounted);
      fetchQuestions();
      setIsMounted(true);
    }
  }, []);

  const handleAddQuestions = (access_code: string) => {
    console.log('Starting quiz:', access_code); 
    navigate(`/host/${access_code}`, { state: { username, userId } });
  };

  const handleStartQuiz = (access_code: string) => {
    console.log('Starting quiz:', access_code);
    navigate(`/host/${access_code}/start`, { state: {username, userId, access_code, maxTime, questions: []} }); 
  };


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/quiz/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          name: quizName,
          created_by: userId,
          access_code: Math.random().toString(36).substring(2, 8),
          valid_till: "9999-12-31T23:59:59",
          is_active: "N",
          max_time: maxTime, // Pass the max time per question
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log(data);
        setQuestions([...questions, data]);
        handleClose();
      } else {
        console.error('Failed to create quiz');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  if (!isLogin) {
    return <Navigate to="/" />;
  }
  // if (start) {
  //   // If start is true, render the RunSession component
  //   return <RunSession userId={userId} username={username} questions={[]} session_id={access_code} />;
  // }

//  if (addQuestion) {
//     return <Questions userId={userId} username={username} />; // Pass userId and username as props
//   }

  return (
    <Container id="host-container" maxWidth={false} style={{ display: 'flex', maxHeight: '100vh', justifyContent: 'center', alignContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <Grid container justifyContent={'center'} alignContent={'center'} padding={1} display={'flex'} columns={{ xs: 3, sm: 3, md: 3 }}>
        <Grid item container width={100} xs={4} sm={4} padding={1} display={'flex'} justifyContent={'center'} alignContent={'center'} alignItems={'center'}>
          <Box display="flex" component="div" alignItems="flex-start" height="100%">
            <Typography variant="h4">
              Welcome, {username}!
            </Typography>
            <PrimaryButton color="primary" size='small' style={{ marginLeft: '1rem' }} onClick={handleClickOpen}>
              Add Quiz
            </PrimaryButton>
          </Box>
        </Grid>
        <Grid item container width={100} xs={1} sm={1} md={1} padding={1} display={'flex'} justifyContent={'center'} alignContent={'center'} alignItems={'center'}>
          <Divider variant='fullWidth' orientation='vertical' color='black'></Divider>
        </Grid>
        <Grid item container xs={7} sm={7} md={7}>
          <Grid container display={'flex'} spacing={{ xs: 1, md: 1 }} columns={{ xs: 3, sm: 3, md: 3 }}>
            {questions.map((question) => (
              <Grid item key={question.id}>
                <QuestionCard>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5" component="div">
                      {question.name}
                    </Typography>
                    <Box display="flex" alignItems="center" marginLeft="1rem">
                      <AccessTimeIcon fontSize="small" style={{ marginRight: '0.25rem' }} />
                      <Typography variant="body2" color="text.secondary">
                        {question.max_time} sec
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {question.access_code}
                  </Typography>
                  <Box>
                    <PrimaryButton
                      color="primary"
                      size="small"
                      style={{ marginTop: '1rem' }}
                      onClick={() => handleAddQuestions(question.access_code)}
                      disabled={question.is_active === 'Y'} // Disable if is_active is 'Y'
                    >
                      Add Questions
                    </PrimaryButton>
                    <PrimaryButton
                      color="secondary"
                      size="small"
                      style={{ marginTop: '1rem', marginLeft: '1rem' }}
                      onClick={() => handleStartQuiz(question.access_code)}
                      disabled={question.is_active === 'Y'} // Disable if is_active is 'Y'
                    >
                      Start Quiz
                    </PrimaryButton>
                  </Box>
                </QuestionCard>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Quiz</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Quiz Name"
            type="text"
            fullWidth
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Time Per Question (seconds)"
            type="number"
            fullWidth
            value={maxTime}
            onChange={(e) => setMaxTime(Number(e.target.value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog> 
    </Container>
  );
};

export default HostPage;