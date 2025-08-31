import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    UPLOAD_FOLDER = 'static/uploads'
    
    # IA - GOOGLE GEMINI
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
