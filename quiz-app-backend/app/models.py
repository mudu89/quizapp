from sqlalchemy import Column, Integer, String, Sequence, ForeignKey, TIMESTAMP, JSON, UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())

class Quiz(Base):
    __tablename__ = 'quiz'
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    created_by = Column(PG_UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    access_code = Column(String(255), unique=True, nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())
    valid_till = Column(TIMESTAMP, nullable=True)
    is_active = Column(String(10), nullable=False)
    session_id = Column(PG_UUID(as_uuid=True), unique=True, nullable=True)  # Updated to match UNIQUE constraint
    max_time = Column(Integer, nullable=False)  # New column for maximum time in seconds

class Question(Base):
    __tablename__ = 'questions'
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    access_code = Column(String(255), ForeignKey('quiz.access_code'), nullable=False)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    question = Column(JSON, nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())

class QuizExecution(Base):
    __tablename__ = 'quiz_executions'

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    access_code = Column(String(255), ForeignKey('quiz.access_code'), nullable=False)
    username = Column(String(255), nullable=False)
    session_id = Column(PG_UUID(as_uuid=True),  nullable=True)
    started_at = Column(TIMESTAMP, default=func.now())
    completed_at = Column(TIMESTAMP, nullable=True)
    score = Column(Integer, default=0)
