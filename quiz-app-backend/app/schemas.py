from pydantic import BaseModel, EmailStr, Json
from typing import Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime

# User Signup Model
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

# User Login Model
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# User Response Model (Excludes Password)
class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        orm_mode = True

# Quiz Creation Model
class QuizCreate(BaseModel):
    name: str
    max_time: int  # Maximum time in seconds
    created_by: UUID  # User ID

# Quiz Response Model
class QuizResponse(BaseModel):
    id: UUID
    name: str
    access_code: str
    created_by: UUID
    created_at: datetime
    valid_till: datetime | None
    is_active: str
    session_id: UUID | None
    max_time: int  # Maximum time in seconds

    class Config:
        orm_mode = True


# Question Creation Model
class QuestionCreate(BaseModel):
    access_code: str
    user_id: UUID
    question: Dict[str, Any]

# Question Response Model
class QuestionResponse(BaseModel):
    id: int
    question: str
    answers: List[Dict[str, Any]]

    class Config:
        orm_mode = True

# QuizExecution Creation Model
class QuizExecutionCreate(BaseModel):
    access_code: str
    username: str
    session_id: Optional[UUID] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    score: Optional[int] = 0

# QuizExecution Response Model
class QuizExecutionResponse(BaseModel):
    id: UUID
    access_code: str
    username: str
    session_id: Optional[UUID]
    started_at: datetime
    completed_at: Optional[datetime]
    score: int

    class Config:
        orm_mode = True

# QuizExecution Update Model
class QuizExecutionUpdate(BaseModel):
    username: str
    access_code: str
    session_id: UUID
    score: int
    completed_at: Optional[datetime] = None

# QuizExecution Get Response Model
class QuizExecutionGet(BaseModel):
    usernames: List[str]

    class Config:
        orm_mode = True

class LeaderboardResponse(BaseModel):
    username: str
    score: int