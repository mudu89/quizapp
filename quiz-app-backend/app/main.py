import random
import string
from typing import List
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import SessionLocal, create_quiz_session, get_db, get_quizzes, get_user_by_email, create_user, create_quiz, get_questions_by_quiz,create_question, add_quiz_execution, update_quiz_execution, get_players, get_active_session_id, update_quiz_execution_score, get_player_details, get_leaderboard_data # Import the new function
from . import schemas
import bcrypt
from uuid import UUID
import json
import logging
from .webchat import ConnectionManager

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO,
    handlers=[
        logging.FileHandler("app.log"),  # Save logs to app.log
        logging.StreamHandler()  # Print logs in console
    ]
)
logger = logging.getLogger(__name__)


# Create the FastAPI application instance
app = FastAPI()

manager = ConnectionManager()

# Allow CORS requests from the front end
origins = [
    "http://localhost",  # Adjust this to match your front-end URL
    "http://localhost:3000",  # Common port for React development server
    '*'
    # Add other origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def read_root():
    return {"message": "Welcome to the Quiz App API!"}

@app.post("/login/", response_model=schemas.UserResponse)
async def check_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    logger.info(f"Login attempt for user: {user.email}")
    db_user = get_user_by_email(user.email, db)
    if db_user and bcrypt.checkpw(user.password.encode('utf-8'), db_user.password.encode('utf-8')):
        logger.info(f"User {user.email} logged in successfully")
        return db_user
    else:
        logger.warning(f"Login failed for user: {user.email}")
        raise HTTPException(status_code=404, detail="User not found")

@app.post("/signup/", response_model=schemas.UserResponse)
async def signup(user: schemas.UserSignup, db: Session = Depends(get_db)):
    logger.info(f"Signup attempt for user: {user.email}")
    db_user = get_user_by_email(user.email, db)
    if db_user:
        logger.warning(f"Signup failed: Email {user.email} already registered")
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    new_user = create_user(user.name, user.email, hashed_password, db)
    logger.info(f"User {user.email} signed up successfully")
    return new_user

@app.post("/quiz/", response_model=schemas.QuizResponse)
async def create_quiz_endpoint(quiz: schemas.QuizCreate, db: Session = Depends(get_db)):
    access_code = "".join(random.choices(string.ascii_letters + string.digits, k=6)).upper()
    logger.info(f"Creating quiz with name: {quiz.name}")
    return create_quiz(quiz.name, quiz.created_by, access_code, "9999-12-31 23:59:59", "N", quiz.max_time, db)

@app.get("/quiz/", response_model=List[schemas.QuizResponse])
def get_quiz(
    user_id: UUID,
    access_code: str = None,
    session_id: UUID = None,
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching quizzes for user_id: {user_id}, access_code: {access_code}, session_id: {session_id}")
    
    # Call the database function to fetch quizzes
    quizzes = get_quizzes(user_id=user_id, access_code=access_code, session_id=session_id, db=db)
    
    logger.info(f"Found {len(quizzes)} quizzes for user_id: {user_id}")
    return quizzes

@app.put("/quiz/", response_model=schemas.QuizResponse)
async def update_quiz_session(
    user_id: UUID,
    access_code: str,
    type: str,
    db: Session = Depends(get_db)
):
    logger.info(f"Updating session_id and is_active for quiz with access_code: {access_code} by user_id: {user_id}")
    if type == "start":
        quiz = create_quiz_session(access_code.upper(), user_id, "Y", db)
    elif type == "end":
        quiz = create_quiz_session(access_code.upper(), user_id, "N", db)
    logger.info(f"Quiz with access_code {access_code} updated successfully")
    return quiz

@app.post("/questions/", response_model=schemas.QuestionResponse)
async def create_question_endpoint(question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    logger.info(f"Creating question for quiz_id: {question.access_code.upper()} by user_id: {question.user_id}")
    question = create_question(question.access_code, question.user_id, question.question, db)
    return question.question

@app.get("/questions/", response_model=List[schemas.QuestionResponse])
def get_questions(user_id: UUID, access_code: str, db: Session = Depends(get_db)):
    logger.info(f"Fetching questions for user_id: {user_id} and access_code: {access_code}")
    questions = get_questions_by_quiz(user_id, access_code.upper(), db)
    return [question.question for question in questions]

@app.post("/player/", response_model=schemas.QuizExecutionResponse)
async def add_player(
    quiz_execution: schemas.QuizExecutionCreate, 
    db: Session = Depends(get_db)
):
    logger.info(f"Creating quiz execution for quiz_access_code: {quiz_execution.access_code}, username: {quiz_execution.username}, session_id: {quiz_execution.session_id}")
    
    # Call the database function to create a new quiz execution
    new_execution = add_quiz_execution(quiz_execution, db)
    
    logger.info(f"Quiz execution created with ID: {new_execution.id}")
    return new_execution

@app.put("/player/", response_model=schemas.QuizExecutionResponse)
async def update_player(
    quiz_execution: schemas.QuizExecutionUpdate,
    db: Session = Depends(get_db)
):
    logger.info(f"Updating quiz execution for username: {quiz_execution.username}, access_code: {quiz_execution.access_code}, session_id: {quiz_execution.session_id}")
    
    # Call the database function to update the quiz execution
    updated_execution = update_quiz_execution(quiz_execution, db)
    
    logger.info(f"Quiz execution updated for ID: {updated_execution.id}")
    return updated_execution

@app.get("/players/", response_model=schemas.QuizExecutionGet)
async def get_players_endpoint(
    access_code: str,
    session_id: UUID,
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching players for access_code: {access_code}, session_id: {session_id}")
    
    # Call the database function to get the list of players
    usernames = get_players(access_code, session_id, db)
    
    logger.info(f"Found {len(usernames)} players for access_code: {access_code}, session_id: {session_id}")
    return {"usernames": usernames}

@app.get("/player/", response_model=schemas.QuizExecutionResponse)
async def get_player_detail(
    player_id: UUID,
    session_id: UUID,
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching player details for player_id: {player_id}, session_id: {session_id}")
    
    # Query the database for the player with the given player_id and session_id
    player = get_player_details(player_id, session_id, db)
    
    if not player:
        logger.warning(f"No player found with player_id: {player_id} and session_id: {session_id}")
        raise HTTPException(status_code=404, detail="Player not found")
    
    logger.info(f"Player details fetched successfully for player_id: {player_id}")
    return player

@app.get("/quiz/session", response_model=schemas.QuizResponse)
async def get_active_session_id_endpoint(
    access_code: str,
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching session_id for access_code: {access_code} where is_active = 'Y'")
    
    # Query the database for the quiz with the given access_code and is_active = "Y"
    quiz = get_active_session_id(access_code, db)
    
    if not quiz:
        logger.warning(f"No active session found for access_code: {access_code}")
        raise HTTPException(status_code=404, detail="No active session found")
    logger.info(f"{quiz} is the active session_id for access_code: {access_code}")
    return quiz

@app.get("/leaderboard/", response_model=List[schemas.LeaderboardResponse])
async def get_leaderboard(
    session_id: UUID,
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching leaderboard for session_id: {session_id}")
    
    # Query the database for the top 10 players with the highest scores
    leaderboard = get_leaderboard_data(session_id, db)
    
    if not leaderboard:
        logger.warning(f"No players found for session_id: {session_id}")
        raise HTTPException(status_code=404, detail="No players found for the given session_id")
    
    logger.info(f"Leaderboard fetched successfully for session_id: {session_id}")
    return [{"username": player.username, "score": player.score} for player in leaderboard]

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Continuously listen for messages from the WebSocket connection
            data = await websocket.receive_json()
            logger.info(f"Received data: {data}")

            # Extract action type and session ID
            action_type = data.get('action')
            session_id = data.get('session_id')
            payload = data.get('data')

            if not action_type or not session_id:
                logger.warning("Invalid message format received")
                await manager.send_personal_message("Invalid message format", websocket)
                continue

            # Handle different action types
            if action_type == 'question':
                logger.info(f"Broadcasting question to session {session_id}")
                await manager.broadcast(session_id, data)
            
            elif action_type == 'answer':
                logger.info(f"Received answer for session {session_id}")
                player_id = payload.get('user_id')
                isAnswered = payload.get('isAnswered')
                player_name = payload.get('username')
                session_id = payload.get('session_id')
                max_time = payload.get('maxTime')  # Maximum time for the question
                time_taken = payload.get('timeTaken')  # Time taken by the player to answer

                if isAnswered:
                    crct_answer_marks = 10  # Marks for a correct answer
                    logger.info(f"Correct answer received for player {player_id} in session {session_id}")

                    # Calculate time-based marks
                    if max_time and time_taken is not None:
                        # Divide max_time into 5 percentile intervals
                        manager.update_top_time_taken(session_id, player_id, time_taken)
                    with SessionLocal() as db:
                        try:
                            updated_execution = update_quiz_execution_score(session_id, player_id, crct_answer_marks, db)
                            logger.info(f"Updated score for player {player_id}: {updated_execution.score}")
                        except HTTPException as e:
                            logger.warning(f"Failed to update score: {e.detail}")
                
                    logger.info(f"Top Time taken players for session {session_id}: {manager.top_time_taken[session_id]}")   
    
                else:
                    logger.info(f"Incorrect answer received for player {player_id} in session {session_id}")
            
            elif action_type == 'calculate':
                session_id = payload.get('session_id')
                logger.info(f"Processing top 3 time_taken for session {session_id}")
                logger.info(manager.top_time_taken)
                if session_id in manager.top_time_taken:
                    # Sort the top_time_taken list by time_taken in ascending order
                    #sorted_times = sorted(manager.top_time_taken[session_id], key=lambda x: x["time_taken"])
                    top_times = sorted(manager.top_time_taken[session_id].keys())[:3]
                    logger.info(f"Sorted time_taken for session {session_id}: {top_times}")

                    # Assign scores based on index position
                    score_mapping = [100, 75, 50]  # Scores for the top 3 players
                    
                    # Example: Process the top 3 values (e.g., send them to the host or store in the database)
                    for time, player_ids in manager.top_time_taken[session_id].items():
                         # Get the index of the player in the sorted list
                        assigned_score = score_mapping[top_times.index(time)] if time in top_times else 25
                        #logger.info(f"Player {player_id} with time_taken {time_taken} is in the top 3")

                        with SessionLocal() as db:
                            try:
                                for player_id in player_ids:
                                    updated_execution = update_quiz_execution_score(session_id, player_id, assigned_score, db)
                                    logger.info(f"Assigned score {assigned_score} to player {player_id} with time_taken {time}")
                            except HTTPException as e:
                                logger.warning(f"Failed to update score for player {player_id}: {e.detail}")
                else:
                    logger.warning(f"No top 3 data found for session {session_id}")
                # Broadcast the top 3 players to all clients in the session
            
            elif action_type == 'leaderboard':
                logger.info(f"Broadcasting leaderboard to session {session_id}")
                # Send the leaderboard data to the host
                await manager.broadcast(session_id, data)
                
            elif action_type == 'end':
                logger.info(f"Host ended session {session_id}")
                if websocket == manager.host_conncetion:
                    # Broadcast the end message to all clients in the session
                    await manager.broadcast(session_id, data)
                    # Disconnect all active connections in the session
                    logger.info(f"Disconnecting active connections")
                    logger.info(f"Active connections: {manager.active_connections}")
                    await manager.disconnect_all()
                    # Exit the loop
                    break
            elif action_type == 'leave':
                logger.info(f"Client left session {session_id}")
                manager.disconnect(websocket)
                await manager.send_personal_message(f"You left session {session_id}", websocket)
            else:
                logger.warning(f"Unknown action type: {action_type}")
                await manager.send_personal_message(f"Unknown action: {action_type}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("WebSocket connection closed")