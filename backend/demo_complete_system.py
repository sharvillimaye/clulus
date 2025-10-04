#!/usr/bin/env python3
"""
Demo: Complete System - Enter input and download video/audio
"""

import requests
import json
import time

def demo_complete_system():
    """Demo the complete system workflow."""
    
    print("🎯 COMPLETE SYSTEM DEMO")
    print("=" * 50)
    print("Enter a math question and get audio/video output!")
    print()
    
    # Get user input
    question = input("Enter a math question: ").strip()
    if not question:
        question = "Find the derivative of x^2 + 3x"
        print(f"Using default: {question}")
    
    print()
    print(f"🎯 Processing: {question}")
    print()
    
    # API endpoint
    base_url = "http://localhost:8084"
    
    try:
        # Step 1: Generate lesson with audio
        print("🤖 Step 1: Generating lesson content and audio...")
        response = requests.post(f"{base_url}/generate-lesson", json={
            "question": question,
            "with_audio": True
        })
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Lesson generated successfully!")
            print(f"📝 Title: {result['lesson_data']['title']}")
            print(f"📊 Steps: {len(result['lesson_data']['steps'])}")
            print(f"🎵 Audio: {result['audio_url']}")
            print()
            
            # Step 2: Download the audio file
            if 'audio_url' in result:
                print("🎵 Step 2: Downloading audio file...")
                audio_response = requests.get(f"{base_url}{result['audio_url']}")
                
                if audio_response.status_code == 200:
                    # Save audio file
                    audio_filename = f"downloaded_lesson_{int(time.time())}.mp3"
                    with open(audio_filename, 'wb') as f:
                        f.write(audio_response.content)
                    
                    file_size = len(audio_response.content)
                    print(f"✅ Audio downloaded successfully!")
                    print(f"📁 File: {audio_filename}")
                    print(f"📊 Size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
                    print()
                    
                    # Step 3: Show lesson content
                    print("📚 Step 3: Lesson Content:")
                    for i, step in enumerate(result['lesson_data']['steps'], 1):
                        print(f"  {i}. {step}")
                    print()
                    
                    print("🎉 COMPLETE SYSTEM WORKING!")
                    print("✅ Gemini AI: Generated lesson content")
                    print("✅ ElevenLabs: Generated natural speech")
                    print("✅ Flask API: Served audio file")
                    print("✅ Download: Audio file ready to play")
                    print()
                    print("🎧 You can now play the audio file!")
                    print(f"🎵 File: {audio_filename}")
                    
                else:
                    print(f"❌ Failed to download audio: {audio_response.status_code}")
            else:
                print("❌ No audio URL in response")
                
        else:
            print(f"❌ Failed to generate lesson: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask server")
        print("💡 Make sure the server is running: python3 app.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    demo_complete_system()
