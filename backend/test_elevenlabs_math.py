#!/usr/bin/env python3
"""
Test ElevenLabs TTS with math question solution
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

def test_elevenlabs_math():
    """Test ElevenLabs TTS with a math solution."""
    
    # Get API key
    api_key = os.getenv('ELEVENLABS_KEY')
    if not api_key:
        print("❌ No ELEVENLABS_KEY found in .env file")
        return False
    
    print(f"🎵 Testing ElevenLabs TTS with API key: {api_key[:10]}...")
    
    # Math solution text
    math_solution = """
    Welcome to this math lesson. Today we will find the derivative of x squared plus 3x.
    
    Step 1: We start with our function f of x equals x squared plus 3x.
    
    Step 2: To find the derivative, we apply the power rule. The derivative of x squared is 2x, and the derivative of 3x is 3.
    
    Step 3: Therefore, f prime of x equals 2x plus 3.
    
    The derivative of x squared plus 3x is 2x plus 3.
    """
    
    print("📝 Math solution text:")
    print(math_solution)
    print()
    
    try:
        # ElevenLabs API call
        url = "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM"  # Rachel's voice
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key
        }
        
        data = {
            "text": math_solution,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        print("🎵 Generating audio with ElevenLabs...")
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            # Save the audio file
            audio_filename = "math_lesson_audio.mp3"
            with open(audio_filename, "wb") as f:
                f.write(response.content)
            
            file_size = os.path.getsize(audio_filename)
            print(f"✅ Audio generated successfully!")
            print(f"📁 File: {audio_filename}")
            print(f"📊 Size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
            print()
            print("🎉 ElevenLabs TTS is working perfectly for math solutions!")
            print("🎧 You can now play the audio file to hear the math lesson.")
            
            return True
        else:
            print(f"❌ ElevenLabs API error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🧮 Testing ElevenLabs TTS with Math Solution")
    print("=" * 50)
    test_elevenlabs_math()
