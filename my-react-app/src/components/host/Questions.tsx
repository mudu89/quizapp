import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Typography, Grid, Box, TextField, Button } from '@mui/material';
import QuestionCard from './QuestionCard';
import { API_URL } from '../common/config';

interface Answer {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

interface QuestionsProps {
  location: {
    state: {
      userId: number;
      username: string;
    };
  };
}

const Questions: React.FC<QuestionsProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>(location.state?.username || '');
  const [userId, setUserId] = useState<number>(location.state?.userId || 0);
  const { access_code } = useParams<{ access_code: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswers, setNewAnswers] = useState<string[]>(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
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
          setQuestions(data);
        } else {
          console.error('Failed to fetch questions');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchQuestions();
  }, [userId, access_code]);

  const handleAddQuestion = async () => {
    const newQuestionObj: Question = {
      id: questions.length + 1,
      question: newQuestion,
      answers: newAnswers.map((answer, index) => ({
        text: answer,
        isCorrect: index === correctAnswerIndex,
      })),
    };

    console.log(newQuestionObj)
    try {
      const response = await fetch(`${API_URL}/questions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          access_code: access_code,
          user_id: userId,
          question: newQuestionObj,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        setQuestions([...questions, data]);
        setNewQuestion('');
        setNewAnswers(['', '', '', '']);
        setCorrectAnswerIndex(0);
      } else {
        console.error('Failed to add question');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Container
      id="question-container"
      maxWidth={false}
      style={{
        display: 'flex',
        flexDirection: 'row', // Set the main container to display as a row
        height: '100%',
        overflow: 'hidden',
        padding: '1rem',
      }}
    >
      {/* Questions List */}
      <Box
        style={{
          flex: '1 1 50%',
          overflowY: 'auto',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          marginRight: '1rem', // Add spacing between columns
        }}
      >
        <Typography variant="h4" gutterBottom>
          Available Questions - {access_code} - {username}
        </Typography>
        <Grid container spacing={2}>
          {questions.map((question) => (
            <Grid item xs={12} sm={6} md={6} key={question.id}>
              <QuestionCard>
                <Typography variant="h6">
                  {question.id}. {question.question}
                </Typography>
                {question.answers.map((answer, index) => (
                  <Box
                    key={index}
                    style={{
                      backgroundColor: answer.isCorrect ? 'lightgreen' : 'inherit',
                      padding: '0.5rem',
                      margin: '0.5rem 0',
                    }}
                  >
                    <Typography variant="body2">{answer.text}</Typography>
                  </Box>
                ))}
              </QuestionCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Add Question Form */}
      <Box
        style={{
          flex: '1 1 50%',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Add Question
        </Typography>
        <TextField
          label="Question"
          variant="outlined"
          fullWidth
          margin="dense"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        {newAnswers.map((answer, index) => (
          <TextField
            key={index}
            label={`Option ${index + 1}`}
            variant="outlined"
            fullWidth
            margin="dense"
            value={answer}
            onChange={(e) => {
              const updatedAnswers = [...newAnswers];
              updatedAnswers[index] = e.target.value;
              setNewAnswers(updatedAnswers);
            }}
          />
        ))}
        <TextField
          label="Correct Answer Index"
          variant="outlined"
          fullWidth
          margin="dense"
          type="number"
          value={correctAnswerIndex}
          onChange={(e) => setCorrectAnswerIndex(Number(e.target.value))}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddQuestion}
          style={{ marginTop: '1rem' }}
        >
          Add Question
        </Button>
      </Box>
    </Container>
  );
};

export default Questions;