import uuid
from sqlalchemy import create_engine, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi import Depends, HTTPException
from . import models
import os
# Database connection URL
if os.getenv("APP_ENV") == "production":
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")
else:
    DB_HOST = "localhost"
    DB_PORT = "5436"
    DB_PASSWORD = "developer"
    DB_USER = "developer"
    DB_NAME = "sky-quiz-db"


DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create the database engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# Create the database tables if they do not exist
models.Base.metadata.create_all(bind=engine, checkfirst=True)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to get a user by email
def get_user_by_email(email: str, db: Session):
    return db.query(models.User).filter(models.User.email == email).first()

# Function to create a new user
def create_user(name: str, email: str, hashed_password: str, db: Session):
    new_user = models.User(
        name=name,
        email=email,
        password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# Function to get quizzes for a user
def get_quizzes_by_user(user_id: str, db: Session):
    return db.query(models.Quiz).filter(models.Quiz.created_by == user_id).all()

# Function to create a new quiz
def create_quiz(name: str, created_by: str, access_code: str, valid_till: str, is_active: str, max_time: int, db: Session):
    new_quiz = models.Quiz(
        name=name,
        created_by=created_by,
        access_code=access_code,
        valid_till=valid_till,
        is_active=is_active,
        max_time=max_time
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)
    return new_quiz

# Function to get questions for a quiz
def get_questions_by_quiz(user_id: str, access_code: str, db: Session):
    return db.query(models.Question).filter(models.Question.user_id == user_id, models.Question.access_code == access_code).all()

# Function to create a new question
def create_question(access_code: str, user_id: str, question: dict, db: Session):
    new_question = models.Question(
        access_code=access_code,
        user_id=user_id,
        question=question
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    return new_question

def create_quiz_session(access_code: str, user_id: str, is_active: str,db: Session):
    quiz = db.query(models.Quiz).filter(models.Quiz.access_code == access_code, models.Quiz.created_by == user_id).first()
    print(quiz)
    quiz.session_id = uuid.uuid4() if is_active == "Y" else None
    quiz.is_active = is_active
    db.commit()
    db.refresh(quiz)
    return quiz

# Function to fetch quizzes with optional filters
def get_quizzes(user_id: str, access_code: str = None, session_id: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Quiz).filter(models.Quiz.created_by == user_id)
    
    # Apply additional filters
    if access_code and session_id:
        query = query.filter(
            models.Quiz.access_code == access_code,
            models.Quiz.session_id == session_id
        )
    elif access_code:
        query = query.filter(models.Quiz.access_code == access_code)
    elif session_id:
        query = query.filter(models.Quiz.session_id == session_id)
    
    return query.all()

# Function to create a new quiz execution
def add_quiz_execution(quiz_execution_data, db: Session):
    new_execution = models.QuizExecution(
        access_code=quiz_execution_data.access_code,
        username=quiz_execution_data.username,
        session_id = quiz_execution_data.session_id,
        started_at=quiz_execution_data.started_at if quiz_execution_data.started_at else func.now(),
        completed_at=quiz_execution_data.completed_at,
        score=quiz_execution_data.score or 0
    )
    db.add(new_execution)
    db.commit()
    db.refresh(new_execution)
    return new_execution

# Function to update a quiz execution
def update_quiz_execution(quiz_execution_data, db: Session):
    # Fetch the quiz execution record
    quiz_execution = db.query(models.QuizExecution).filter(
        models.QuizExecution.access_code == quiz_execution_data.access_code,
        models.QuizExecution.session_id == quiz_execution_data.session_id,
        models.QuizExecution.username == quiz_execution_data.username
    ).first()

    if not quiz_execution:
        raise HTTPException(status_code=404, detail="Quiz execution not found")

    # Update the fields
    quiz_execution.score = quiz_execution_data.score
    if quiz_execution_data.completed_at:
        quiz_execution.completed_at = quiz_execution_data.completed_at

    # Commit the changes
    db.commit()
    db.refresh(quiz_execution)
    return quiz_execution

# Function to update the score for a quiz execution
def update_quiz_execution_score(session_id: str, player_id: str, increment: int, db: Session):
    quiz_execution = db.query(models.QuizExecution).filter(
        models.QuizExecution.session_id == session_id,
        models.QuizExecution.id == player_id
    ).first()

    if not quiz_execution:
        raise HTTPException(status_code=404, detail="Quiz execution not found")

    # Increment the score
    quiz_execution.score += increment
    db.commit()
    db.refresh(quiz_execution)
    return quiz_execution

# Function to get the list of players for a given access_code and session_id
def get_players(access_code: str, session_id: str, db: Session):
    players = db.query(models.QuizExecution.username).filter(
        models.QuizExecution.access_code == access_code,
        models.QuizExecution.session_id == session_id
    ).all()
    return [player[0] for player in players]  # Extract usernames from query results

def get_player_details(player_id: str, session_id: str, db: Session):
    query = db.query(models.QuizExecution).filter(
        models.QuizExecution.id == player_id,
        models.QuizExecution.session_id == session_id
    )

    return query.first()

# Function to get the active session ID for a given access_code
def get_active_session_id(access_code: str, db: Session):
    query = db.query(models.Quiz).filter(
        models.Quiz.access_code == access_code,
        models.Quiz.is_active == "Y"
    )
    
    return query.first()

# Function to fetch the leaderboard for a given session_id
def get_leaderboard_data(session_id: str, db: Session):
    leaderboard = db.query(
        models.QuizExecution.username,
        models.QuizExecution.score
    ).filter(
        models.QuizExecution.session_id == session_id
    ).order_by(
        models.QuizExecution.score.desc()
    ).limit(10).all()
    
    if not leaderboard:
        raise HTTPException(status_code=404, detail="No players found for the given session_id")
    
    return leaderboard