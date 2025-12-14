from pydantic import BaseModel, EmailStr, field_validator
from typing import Literal
import datetime         

# --- 1. Define Fixed Options (Enums) ---
GenderType = Literal["Male", "Female", "Other"]

SecurityQuestionType = Literal[
    "What is the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the name of your elementary school?",
    "What city were you born in?",
    "What is your favorite food?"
]

# --- Signup Input Model ---
class UserSignup(BaseModel):
    first_name: str
    last_name: str
    gender: GenderType
    age: int
    email: EmailStr
    password: str
    security_question: SecurityQuestionType
    security_answer: str

    # --- AGE VALIDATION (New Rule) ---
    @field_validator('age')
    @classmethod
    def validate_age(cls, v: int) -> int:
        if v < 18:
            raise ValueError('You must be 18 or older to sign up')
        return v

    # --- PASSWORD VALIDATION ---
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one number')
        if not any(char.isalpha() for char in v):
            raise ValueError('Password must contain at least one letter')
        return v

# --- Login Input Model ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- Output Model ---
class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr

# --- Schema for displaying a Trip in a list ---
class TripSummary(BaseModel):
    id: int
    trip_code: str
    trip_name: str
    is_trip_confirmed: bool
    is_voting_closed: bool
    
    class Config:
        from_attributes = True

# --- Schema for the Full Profile Page ---
class UserProfile(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    gender: str
    age: int
    
    # Lists of Trips
    created_trips: list[TripSummary] = []
    joined_trips: list[TripSummary] = []
    

# --- Trip Creation Input ---
class TripCreate(BaseModel):
    user_id: int
    trip_name: str
    home_town: str
    budget_range: str
    start_date: str
    end_date: str
    preference_tags: list[str] # e.g. ["Adventure", "Beach"]
    voting_days: int # User selects 1, 2, or 3 days for voting

# --- Join Trip Input ---
class TripJoin(BaseModel):
    user_id: int
    trip_code: str
    home_town: str
    budget_range: str
    start_date: str
    end_date: str
    preference_tags: list[str]

class StatItem(BaseModel):
    name: str
    value: int

class TripDetail(BaseModel):
    id: int
    trip_name: str
    trip_code: str
    leader_id: int
    is_trip_confirmed: bool
    created_at: datetime.datetime = None # Optional
    
    # The Participants
    participants: list[str] # List of names

    has_itinerary: bool
    
    # The Stats (Pre-calculated for charts)
    budget_stats: list[StatItem]
    tag_stats: list[StatItem]


    class Config:
        from_attributes = True