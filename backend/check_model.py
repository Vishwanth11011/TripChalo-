import google.generativeai as genai

# PASTE YOUR KEY HERE
genai.configure(api_key="AIzaSyDvvMwyF7bbg99R3_3glV5ewON_6FVDjRM") 

print("Checking available models...")
try:
    for m in genai.list_models():
        # We only care about models that can generate content
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error connecting to Google: {e}")