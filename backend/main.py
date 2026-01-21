from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
import models, schemas, utils
import random
import string
import datetime            # <--- This was missing
from datetime import timedelta
from collections import Counter
import recommendation_service # Import the AI file
import json
from pydantic import BaseModel

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS Setup (Allows Frontend to talk to Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to "*" to allow any URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 1. SIGNUP ENDPOINT ---
@app.post("/signup", response_model=schemas.UserResponse)
def signup(user_in: schemas.UserSignup, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )

    # Hash the password AND security answer 
    hashed_pwd = utils.hash_password(user_in.password)
    hashed_ans = utils.hash_password(user_in.security_answer)

    # Create new User object
    new_user = models.User(
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        gender=user_in.gender,
        age=user_in.age,
        email=user_in.email,
        hashed_password=hashed_pwd,
        security_question=user_in.security_question,
        hashed_security_answer=hashed_ans
    )

    # Save to Database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

# --- 2. LOGIN ENDPOINT ---
@app.post("/login")
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    
    # # 1. Find the user
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    
    # # --- DEBUGGING LOGS (Check your terminal!) ---
    print(f"\n--- LOGIN ATTEMPT FOR: {user_in.email} ---")
    if not user:
        print("❌ RESULT: User not found in database.")
    else:
        print(f"✅ User found: ID {user.id}")
        print(f"🔑 Stored Hash in DB: {user.hashed_password}")
        print(f"⌨️  Input Password:  {user_in.password}")
        
        # Verify
        is_match = utils.verify_password(user_in.password, user.hashed_password)
        print(f"❓ Do they match? {is_match}")
        
        if not is_match:
             print("❌ RESULT: Password verification failed.")
    # # ---------------------------------------------

    if not user or not utils.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "user_id": user.id,
        "first_name": user.first_name,
        "name": f"{user.first_name} {user.last_name}",
        "email": user.email
    }

# --- 3. GET USER PROFILE & TRIPS ---
@app.get("/users/{user_id}/profile", response_model=schemas.UserProfile)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    # 1. Fetch User
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Fetch Created Trips (User is Leader)
    created_trips = db.query(models.Trip).filter(models.Trip.leader_id == user_id).all()

    # 3. Fetch Joined Trips (User is Participant)
    # We query the 'TripParticipant' table to find trips this user joined
    participation_records = db.query(models.TripParticipant).filter(models.TripParticipant.user_id == user_id).all()
    
    # Extract the actual Trip objects from the participation records
    joined_trips = [record.trip for record in participation_records]

    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "gender": user.gender,
        "age": user.age,
        "created_trips": created_trips,
        "joined_trips": joined_trips
    }

# --- Helper: Generate Unique 6-Char Code ---
def generate_trip_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# --- 4. CREATE TRIP ENDPOINT ---
@app.post("/trips/create")
def create_trip(trip_in: schemas.TripCreate, db: Session = Depends(get_db)):
    # 1. Generate Unique Code
    new_code = generate_trip_code()
    
    # Ensure code is truly unique (simple check)
    while db.query(models.Trip).filter(models.Trip.trip_code == new_code).first():
        new_code = generate_trip_code()

    # 2. Calculate Deadline
    deadline = datetime.datetime.utcnow() + timedelta(days=trip_in.voting_days)

    # 3. Create Trip Object
    new_trip = models.Trip(
        trip_name=trip_in.trip_name,
        trip_code=new_code,
        leader_id=trip_in.user_id,
        voting_deadline=deadline
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip) # We need the new Trip ID

    # 4. Add Leader as the First Participant
    leader_entry = models.TripParticipant(
        user_id=trip_in.user_id,
        trip_id=new_trip.id,
        home_town=trip_in.home_town,
        budget_range=trip_in.budget_range,
        start_date=trip_in.start_date,
        end_date=trip_in.end_date,
        preference_tags=trip_in.preference_tags
    )
    db.add(leader_entry)
    db.commit()

    return {"status": "success", "trip_id": new_trip.id, "trip_code": new_code}


# --- 5. JOIN TRIP ENDPOINT ---
@app.post("/trips/join")
def join_trip(join_in: schemas.TripJoin, db: Session = Depends(get_db)):
    # 1. Find the Trip by Code
    trip = db.query(models.Trip).filter(models.Trip.trip_code == join_in.trip_code).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Invalid Trip Code")
    
    # --- FIX 1: CHECK IF LOCKED ---
    if trip.is_trip_confirmed or trip.is_voting_closed:
        raise HTTPException(status_code=400, detail="Voting is completed! You cannot join this trip anymore.")
    # ------------------------------

    # 2. Check if User is already joined
    existing_participant = db.query(models.TripParticipant).filter(
        models.TripParticipant.trip_id == trip.id,
        models.TripParticipant.user_id == join_in.user_id
    ).first()
    
    if existing_participant:
        raise HTTPException(status_code=400, detail="You have already joined this trip!")

    # 3. Add User as Participant
    new_participant = models.TripParticipant(
        user_id=join_in.user_id,
        trip_id=trip.id,
        home_town=join_in.home_town,
        budget_range=join_in.budget_range,
        start_date=join_in.start_date,
        end_date=join_in.end_date,
        preference_tags=join_in.preference_tags
    )
    db.add(new_participant)
    db.commit()

    return {"status": "success", "trip_id": trip.id, "trip_name": trip.trip_name}

# --- 6. GET TRIP DETAILS (With Stats) ---
@app.get("/trips/{trip_id}", response_model=schemas.TripDetail)
def get_trip_details(trip_id: int, db: Session = Depends(get_db)):
    # 1. Fetch Trip
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    # 2. Fetch Participants
    participants = db.query(models.TripParticipant).filter(models.TripParticipant.trip_id == trip_id).all()
    
    # 3. Calculate Stats
    # A. Names
    participant_names = [db.query(models.User).filter(models.User.id == p.user_id).first().first_name for p in participants]
    
    # B. Budgets (Count frequency)
    budget_counts = Counter([p.budget_range for p in participants])
    budget_stats = [{"name": k, "value": v} for k, v in budget_counts.items()]
    
    # C. Tags (Flatten list and count)
    all_tags = []
    for p in participants:
        all_tags.extend(p.preference_tags)
    tag_counts = Counter(all_tags)
    # Get top 5 tags
    tag_stats = [{"name": k, "value": v} for k, v in tag_counts.most_common(5)]

    return {
        "id": trip.id,
        "trip_name": trip.trip_name,
        "trip_code": trip.trip_code,
        "leader_id": trip.leader_id,
        "is_trip_confirmed": trip.is_trip_confirmed,
        "participants": participant_names,
        "budget_stats": budget_stats,
        "tag_stats": tag_stats,
        "has_itinerary": bool(trip.itinerary_data)
    }

# --- 7. LEADER ACTION: LOCK TRIP ---
@app.post("/trips/{trip_id}/lock")
def lock_trip(trip_id: int, user_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if trip.leader_id != user_id:
        raise HTTPException(status_code=403, detail="Only the Leader can lock this trip")
        
    trip.is_trip_confirmed = True
    trip.is_voting_closed = True
    db.commit()
    
    return {"status": "success", "message": "Voting closed. Trip confirmed!"}

# ... inside backend/main.py ...

# --- 8. DELETE TRIP (Leader Only) ---
@app.delete("/trips/{trip_id}")
def delete_trip(trip_id: int, user_id: int, db: Session = Depends(get_db)):
    # 1. Fetch Trip
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # 2. Verify Leader
    if trip.leader_id != user_id:
        raise HTTPException(status_code=403, detail="Only the Leader can delete this trip")

    # 3. Delete Participants first (Cleanup)
    db.query(models.TripParticipant).filter(models.TripParticipant.trip_id == trip_id).delete()

    # 4. Delete Trip
    db.delete(trip)
    db.commit()

    return {"status": "success", "message": "Trip deleted successfully"}

# --- 9. LEAVE TRIP (Participant Only) ---
@app.delete("/trips/{trip_id}/leave")
def leave_trip(trip_id: int, user_id: int, db: Session = Depends(get_db)):
    # 1. Fetch Trip
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # 2. Prevent Leader from leaving (Must delete instead)
    if trip.leader_id == user_id:
        raise HTTPException(status_code=400, detail="Leaders cannot leave. Delete the trip instead.")

    # 3. Find Participant Record
    participant = db.query(models.TripParticipant).filter(
        models.TripParticipant.trip_id == trip_id,
        models.TripParticipant.user_id == user_id
    ).first()

    if not participant:
        raise HTTPException(status_code=400, detail="You are not part of this trip")

    # 4. Delete Record
    db.delete(participant)
    db.commit()

    return {"status": "success", "message": "You have left the trip"}

# --- 10. GENERATE ITINERARY (AI) ---
@app.post("/trips/{trip_id}/generate")
def generate_itinerary(trip_id: int, user_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    
    # Validation
    if not trip: raise HTTPException(status_code=404, detail="Trip not found")
    if trip.leader_id != user_id: raise HTTPException(status_code=403, detail="Only Leader can generate")
    
    # 1. Gather Data
    participants = db.query(models.TripParticipant).filter(models.TripParticipant.trip_id == trip_id).all()
    
    # Get user details (age, gender) for better AI context
    pref_list = []
    for p in participants:
        user_info = db.query(models.User).filter(models.User.id == p.user_id).first()
        pref_list.append({
            "age": user_info.age,
            "gender": user_info.gender,
            "home_town": p.home_town,
            "budget": p.budget_range,
            "tags": p.preference_tags,
            "dates": f"{p.start_date} to {p.end_date}"
        })

    # 2. Call AI Service
    ai_result = recommendation_service.get_trip_recommendations(pref_list)
    
    if not ai_result:
        raise HTTPException(status_code=500, detail="AI Generation Failed")

    # 3. Save to DB (Store as JSON string)
    trip.itinerary_data = json.dumps(ai_result)
    db.commit()
    
    return {"status": "success", "data": ai_result}

# --- 11. GET ITINERARY & VOTES ---
@app.get("/trips/{trip_id}/itinerary")
def get_itinerary(trip_id: int, user_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip or not trip.itinerary_data:
        return {"has_generated": False}

    # Calculate Votes
    votes = db.query(models.TripVote).filter(models.TripVote.trip_id == trip_id).all()
    vote_counts = {1: 0, 2: 0}
    user_vote = None
    
    for v in votes:
        if v.option_selected in vote_counts:
            vote_counts[v.option_selected] += 1
        if v.user_id == user_id:
            user_vote = v.option_selected

    return {
        "has_generated": True,
        "data": json.loads(trip.itinerary_data),
        "votes": vote_counts,
        "user_vote": user_vote,
        "final_choice": trip.final_chosen_option
    }

# --- 12. VOTE FOR OPTION ---
@app.post("/trips/{trip_id}/vote")
def vote_itinerary(trip_id: int, user_id: int, option_id: int, db: Session = Depends(get_db)):
    # Check if user already voted
    existing_vote = db.query(models.TripVote).filter(
        models.TripVote.trip_id == trip_id,
        models.TripVote.user_id == user_id
    ).first()

    if existing_vote:
        existing_vote.option_selected = option_id # Change vote
    else:
        new_vote = models.TripVote(trip_id=trip_id, user_id=user_id, option_selected=option_id)
        db.add(new_vote)
    
    db.commit()
    return {"status": "voted"}

# --- 13. FINALIZE OPTION (Leader) ---
@app.post("/trips/{trip_id}/finalize")
def finalize_trip_option(trip_id: int, user_id: int, option_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if trip.leader_id != user_id: raise HTTPException(status_code=403)
    
    trip.final_chosen_option = option_id
    db.commit()
    return {"status": "finalized"}


# --- 1. GET FULL TRIP DETAILS (For the Page) ---
@app.get("/trips/{trip_id}/confirmed-details")
def get_confirmed_trip_details(trip_id: int, db: Session = Depends(get_db)):
    # Fetch Trip
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip or not trip.is_trip_confirmed:
        raise HTTPException(status_code=404, detail="Trip not found or not confirmed yet")

    # Fetch Participants
    participants = db.query(models.TripParticipant).filter(models.TripParticipant.trip_id == trip_id).all()
    participant_list = []
    for p in participants:
        u = db.query(models.User).filter(models.User.id == p.user_id).first()
        if u:
            participant_list.append({"name": f"{u.first_name} {u.last_name}", "id": u.id})

    # Parse the finalized itinerary data
    # (Assuming we stored the chosen option in 'final_chosen_option' or specific fields)
    # For this implementation, let's assume 'itinerary_data' holds the full JSON of all options
    # and we need to grab the one that matches 'final_chosen_option'.
    
    import json
    final_itinerary = {}
    location_name = "Unknown"
    
    if trip.itinerary_data and trip.final_chosen_option:
        try:
            all_data = json.loads(trip.itinerary_data)
            # Find the option with the matching ID
            chosen = next((opt for opt in all_data.get("options", []) if opt["id"] == trip.final_chosen_option), None)
            if chosen:
                final_itinerary = chosen.get("itinerary", [])
                location_name = chosen.get("location", "Unknown")
        except:
            pass

    return {
        "id": trip.id,
        "trip_name": trip.trip_name,
        "trip_code": trip.trip_code,
        "location": location_name,
        "itinerary": final_itinerary,
        "participants": participant_list,
        "start_date": participants[0].start_date if participants else "", # Rough estimate
    }


# --- 2. CHAT BOT ENDPOINT ---
class ChatRequest(BaseModel):
    message: str

@app.post("/trips/{trip_id}/chat")
def chat_with_trip_bot(trip_id: int, chat_req: ChatRequest, db: Session = Depends(get_db)):
    # 1. Fetch Trip Data again to give context to the bot
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    # 2. Reconstruct the context dictionary
    import json
    trip_context = {}
    if trip.itinerary_data and trip.final_chosen_option:
        try:
            all_data = json.loads(trip.itinerary_data)
            chosen = next((opt for opt in all_data.get("options", []) if opt["id"] == trip.final_chosen_option), None)
            if chosen:
                trip_context = chosen # The whole object (location, cost, itinerary)
        except:
            pass

    # 3. Fetch Participants for context
    participants = db.query(models.TripParticipant).filter(models.TripParticipant.trip_id == trip_id).all()
    people_context = []
    for p in participants:
        u = db.query(models.User).filter(models.User.id == p.user_id).first()
        if u: people_context.append({"name": u.first_name})

    # 4. Call the Python Logic
    bot_reply = recommendation_service.smart_trip_chat(trip_context, people_context, chat_req.message)
    
    return {"response": bot_reply}