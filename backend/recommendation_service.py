import google.generativeai as genai
import os
import json
import re

# Configure the API Key
# Make sure your .env file or environment variable is set correctly
# Or hardcode it temporarily for testing: genai.configure(api_key="YOUR_KEY_HERE")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# if not api_key or api_key == "AIzaSy_YOUR_REAL_API_KEY_HERE":
#     print("⚠️ WARNING: You forgot to paste the actual API key!")
# else:
#     genai.configure(api_key=api_key) 

def get_trip_recommendations(group_preferences_list):
    print("DEBUG: Starting AI Generation...") # Debug print

    # 1. Serialize Data
    prompt_data = json.dumps(group_preferences_list, indent=2)

    # 2. Advanced Prompt
    full_prompt = f"""
    SYSTEM INSTRUCTION:
    You are an expert AI Travel Agent specializing in personalized group travel.
    
    YOUR GOAL:
    Analyze the provided USER DATA and generate exactly TWO distinct trip itineraries.
    
    OUTPUT FORMAT:
    Return ONLY valid JSON. Do not include markdown formatting like ```json or ```.
    
    JSON Schema:
    {{
      "analysis_summary": "Brief summary...",
      "options": [
        {{
          "id": 1,
          "title": "Trip Title",
          "location": "City, Country",
          "total_estimated_cost": "Cost string",
          "vibe_match": "Vibe string",
          "why_its_perfect": "Reasoning...",
          "itinerary": [
            {{ "day": 1, "activity": "..." }},
            {{ "day": 2, "activity": "..." }}
          ]
        }},
        {{
          "id": 2,
          "title": "Trip Title 2",
          "location": "Location 2",
          "total_estimated_cost": "Cost 2",
          "vibe_match": "Vibe 2",
          "why_its_perfect": "Reasoning...",
          "itinerary": []
        }}
      ]
    }}

    USER DATA:
    {prompt_data}
    """

    # FIX 1: Use the correct model name
    model = genai.GenerativeModel("gemini-2.5-flash") 
    
    try:
        response = model.generate_content(full_prompt)
        raw_text = response.text
        
        # FIX 2: Advanced Regex JSON Extraction
        # This searches for the content between the first '{' and the last '}'
        # It fixes issues where AI says "Here is the JSON: ```json ... ```"
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        
        if json_match:
            clean_text = json_match.group(0)
            return json.loads(clean_text)
        else:
            # Fallback if regex fails
            clean_text = raw_text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)

    except Exception as e:
        # FIX 3: Detailed Error Log
        print(f"❌ AI GENERATION ERROR: {e}")
        # If possible, print the raw text to see what went wrong
        try: print(f"Raw Response causing error: {response.text}")
        except: pass
        return None
    
def smart_trip_chat(trip_data, participants, user_query):
    """
    A local, context-aware chatbot that answers based on the Trip DB data.
    No API Keys required.
    """
    query = user_query.lower()
    
    # Parse Itinerary if it's a string
    try:
        if isinstance(trip_data.get('itinerary'), str):
            itinerary = json.loads(trip_data['itinerary'])
        else:
            itinerary = trip_data.get('itinerary', [])
    except:
        itinerary = []

    # --- INTELLIGENCE RULE 1: DAY-SPECIFIC QUESTIONS ---
    day_match = re.search(r"day\s*(\d+)", query)
    if day_match:
        day_num = int(day_match.group(1))
        
        for day_plan in itinerary:
            # Flexible matching for "Day 1", "day 1", "1"
            d_val = str(day_plan.get("day", "")).lower()
            if d_val == str(day_num) or f"day {day_num}" in d_val:
                
                activities = day_plan.get("activities", [])
                # Handle if activity is list or string
                if isinstance(activities, list):
                    formatted_activities = "\n".join([f"- {act}" for act in activities])
                else:
                    formatted_activities = str(activities)
                
                return f"📅 **Day {day_num} Plan:**\n{formatted_activities}"

        return f"I checked the schedule, but I couldn't find specific details for **Day {day_num}**."

    # --- INTELLIGENCE RULE 2: BUDGET / COST ---
    if any(x in query for x in ["cost", "price", "budget", "expensive", "money", "how much"]):
        total_cost = trip_data.get('estimated_cost', 'Not specified')
        return f"💰 **Financial Overview:**\nThe estimated total cost is **{total_cost}**."

    # --- INTELLIGENCE RULE 3: LOCATION ---
    if any(x in query for x in ["where", "location", "destination", "city", "place"]):
        return f"📍 **Destination:**\nWe are going to **{trip_data.get('location', 'Unknown Location')}**!"

    # --- INTELLIGENCE RULE 4: PARTICIPANTS ---
    if any(x in query for x in ["who", "people", "participants", "friends", "coming"]):
        names = [p['name'] for p in participants]
        return f"👥 **The Squad:**\nConfirmed: {', '.join(names)}."

    # --- FALLBACK ---
    return (
        "I am your Trip Assistant! 🤖\n"
        "Ask me about the Plan, Budget, or Who is coming."
    )