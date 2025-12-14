from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    gender = Column(String)
    age = Column(Integer)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    security_question = Column(String, nullable=False)
    hashed_security_answer = Column(String, nullable=False)

    # Relationships
    trips_created = relationship("Trip", back_populates="leader")
    preferences = relationship("TripParticipant", back_populates="user")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    trip_name = Column(String, default="Untitled Trip")
    trip_code = Column(String, unique=True, index=True)
    leader_id = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    voting_deadline = Column(DateTime, nullable=True)
    is_voting_closed = Column(Boolean, default=False)
    is_trip_confirmed = Column(Boolean, default=False)

    # --- NEW AI ITINERARY ATTRIBUTES ---
    itinerary_data = Column(Text, nullable=True) # Stores the AI JSON output as a string
    final_chosen_option = Column(Integer, nullable=True) # 1 or 2

    # Relationships
    leader = relationship("User", back_populates="trips_created")
    participants = relationship("TripParticipant", back_populates="trip")
    votes = relationship("TripVote", back_populates="trip") # Link to votes

class TripParticipant(Base):
    __tablename__ = "trip_participants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    trip_id = Column(Integer, ForeignKey("trips.id"))
    
    home_town = Column(String)
    budget_range = Column(String) 
    start_date = Column(String)
    end_date = Column(String)
    preference_tags = Column(JSON) 

    user = relationship("User", back_populates="preferences")
    trip = relationship("Trip", back_populates="participants")

# --- NEW VOTES TABLE ---
class TripVote(Base):
    __tablename__ = "trip_votes"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    option_selected = Column(Integer) # 1 or 2

    trip = relationship("Trip", back_populates="votes")
    user = relationship("User")