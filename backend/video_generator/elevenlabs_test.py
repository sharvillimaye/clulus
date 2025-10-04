#!/usr/bin/env python3
"""
Test ElevenLabs API integration
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../../.env')

def test_elevenlabs():
    """Test ElevenLabs API with different approaches."""
    api_key = os.getenv('ELEVENLABS_KEY')
    if not api_key:
        print("❌ No ELEVENLABS_KEY found")
        return False
    
    print(f"🎵 Testing ElevenLabs API with key: {api_key[:10]}...")
    
    # Try the new API approach
    try:
        import elevenlabs
        
        # Set environment variable for API key
        os.environ['ELEVENLABS_API_KEY'] = api_key
        
        # Try to use the text_to_speech module
        from elevenlabs import text_to_speech
        
        # Generate audio
        audio = text_to_speech.convert(
            voice_id="21m00Tcm4TlvDq8ikWAM",  # Rachel's voice
            text="Hello, this is a test of ElevenLabs text to speech.",
            model_id="eleven_monolingual_v1"
        )
        
        # Save audio
        from elevenlabs import save
        save(audio, "test_audio.mp3")
        
        print("✅ ElevenLabs API working with text_to_speech module!")
        return True
        
    except Exception as e:
        print(f"❌ ElevenLabs API failed: {e}")
        
        # Try alternative approach
        try:
            print("Trying alternative approach...")
            
            # Use requests directly
            import requests
            
            url = "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM"
            
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": api_key
            }
            
            data = {
                "text": "Hello, this is a test of ElevenLabs text to speech.",
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.5
                }
            }
            
            response = requests.post(url, json=data, headers=headers)
            
            if response.status_code == 200:
                with open("test_audio_direct.mp3", "wb") as f:
                    f.write(response.content)
                print("✅ ElevenLabs API working with direct requests!")
                return True
            else:
                print(f"❌ Direct API call failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e2:
            print(f"❌ Alternative approach failed: {e2}")
            return False

if __name__ == "__main__":
    test_elevenlabs()
