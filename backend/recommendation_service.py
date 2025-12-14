import google.generativeai as genai
import os
import json

# Configure the API Key
genai.configure(api_key="YOUR_API_KEY_HERE") 

def get_trip_recommendations(group_preferences_list):
    # 1. Serialize Data
    prompt_data = json.dumps(group_preferences_list, indent=2)

    # 2. Advanced Prompt Engineering
    full_prompt = f"""
    SYSTEM INSTRUCTION:
    You are an expert AI Travel Agent specializing in personalized group travel.
    
    YOUR GOAL:
    Analyze the provided USER DATA and generate exactly TWO distinct trip itineraries (Option A and Option B).

    ANALYSIS GUIDELINES:
    1. **Origin Analysis**: Look at the 'home_town' of users. If the majority are from a specific country (e.g., India), suggest destinations WITHIN that country unless they explicitly asked for international.
    2. **Diversity**: The destination MUST be different from their home towns. Give them a "vacation vibe" change.
    3. **Demographics**: 
       - Check 'age': If young (18-25), focus on budget, energy, and nightlife. If mixed/older, focus on comfort and accessibility.
       - Check 'gender': Ensure the destination is safe and comfortable for the gender composition of the group.
    4. **Underrated Gems**: Do not just suggest the most obvious tourist trap (e.g., instead of just Goa, suggest Gokarna or Varkala). Comb for budget-friendly but high-value experiences.
    
    THE TWO OPTIONS:
    - **Option 1 (The Crowd Pleaser)**: A balanced choice that statistically fits the majority of preferences (budget, tags, dates).
    - **Option 2 (The Underrated Wildcard)**: A unique, less commercialized gem that fits the budget but offers a distinct experience.

    OUTPUT FORMAT:
    Return ONLY valid JSON. No markdown.
    
    JSON Schema:
    {{
      "analysis_summary": "Brief text explaining how you considered their age, gender, and origins...",
      "options": [
        {{
          "id": 1,
          "title": "Name of the Trip (e.g., 'Hidden Hills of Coorg')",
          "location": "City, State/Country",
          "total_estimated_cost": "₹15,000 per person",
          "vibe_match": "Nature & Chill",
          "why_its_perfect": "Explanation relative to their demographics...",
          "itinerary": [
            {{ "day": 1, "activity": "..." }},
            {{ "day": 2, "activity": "..." }},
            {{ "day": 3, "activity": "..." }}
          ]
        }},
        {{
          "id": 2,
          "title": "Title for Option 2",
          "location": "Location 2",
          "total_estimated_cost": "Cost 2",
          "vibe_match": "Vibe 2",
          "why_its_perfect": "Explanation...",
          "itinerary": [ ... ]
        }}
      ]
    }}

    USER DATA TO PROCESS:
    {prompt_data}
    """

    # 3. Call Gemini
    model = genai.GenerativeModel("gemini-2.5-flash") # Using latest fast model
    
    try:
        response = model.generate_content(full_prompt)
        # Clean potential markdown formatting
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)
    except Exception as e:
        print(f"AI Error: {e}")
        return None