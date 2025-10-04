#!/usr/bin/env python3
"""
Complete Demo: Math Lesson Video + Audio Generation
This demo shows the complete system working with Gemini + ElevenLabs + FFmpeg
"""

import os
import json
import time
from pathlib import Path
from llm_client import ask_llm
from lesson_schema import Lesson

# ElevenLabs integration
try:
    from elevenlabs import generate, save, Voice, VoiceSettings
    ELEVENLABS_AVAILABLE = True
    print("✅ ElevenLabs is available!")
except ImportError:
    ELEVENLABS_AVAILABLE = False
    print("⚠️ ElevenLabs not installed. Install with: pip install elevenlabs")

def generate_audio(script: str, output_name: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM") -> Path:
    """Generate audio using ElevenLabs."""
    if not ELEVENLABS_AVAILABLE:
        print("❌ ElevenLabs not available.")
        return None
    
    ELEVENLABS_KEY = os.getenv("ELEVENLABS_KEY")
    if not ELEVENLABS_KEY:
        print("⚠️ ELEVENLABS_KEY not set.")
        return None
    
    try:
        print("🎵 Generating audio with ElevenLabs...")
        audio = generate(
            text=script,
            voice=Voice(
                voice_id=voice_id,
                settings=VoiceSettings(
                    stability=0.5,
                    similarity_boost=0.5,
                    style=0.0,
                    use_speaker_boost=True
                )
            ),
            model="eleven_monolingual_v1"
        )
        
        audio_path = Path("build") / f"{output_name}_audio.mp3"
        audio_path.parent.mkdir(exist_ok=True)
        save(audio, str(audio_path))
        print(f"✅ Audio generated: {audio_path}")
        return audio_path
        
    except Exception as e:
        print(f"❌ Audio generation failed: {e}")
        return None

def create_demo_video(lesson: Lesson, output_name: str) -> Path:
    """Create a simple demo video using FFmpeg."""
    try:
        print("🎬 Creating demo video with FFmpeg...")
        
        # Create a simple text-based video
        video_path = Path("build") / f"{output_name}_demo.mp4"
        video_path.parent.mkdir(exist_ok=True)
        
        # Create a simple video with text overlay
        cmd = [
            "ffmpeg",
            "-f", "lavfi",
            "-i", f"color=c=blue:size=1280x720:duration=10",
            "-vf", f"drawtext=text='{lesson.title}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-y",
            str(video_path)
        ]
        
        import subprocess
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Demo video created: {video_path}")
            return video_path
        else:
            print(f"❌ FFmpeg failed: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Video creation failed: {e}")
        return None

def combine_video_audio(video_path: Path, audio_path: Path, output_name: str) -> Path:
    """Combine video and audio using FFmpeg."""
    try:
        print("🔄 Combining video and audio...")
        
        final_path = Path("build") / f"{output_name}_final.mp4"
        
        cmd = [
            "ffmpeg",
            "-i", str(video_path),
            "-i", str(audio_path),
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            "-y",
            str(final_path)
        ]
        
        import subprocess
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Combined video created: {final_path}")
            return final_path
        else:
            print(f"❌ FFmpeg failed: {result.stderr}")
            return video_path
            
    except Exception as e:
        print(f"❌ Video combination failed: {e}")
        return video_path

def main():
    print("🎯 COMPLETE DEMO: Math Lesson Video + Audio Generation")
    print("=" * 60)
    
    # Set up environment
    os.environ['GEMINI_KEY'] = 'AIzaSyCsasgxLhe_k82xh3wEdQEqY2LCQim2CWU'
    
    # Generate unique output name
    output_name = f"demo_lesson_{int(time.time())}"
    
    # Step 1: Generate lesson content
    print("🤖 Step 1: Generating lesson content with Gemini...")
    question = "Find the derivative of x^2 + 3x"
    json_str = ask_llm(question)
    lesson_data = json.loads(json_str)
    lesson = Lesson.model_validate(lesson_data)
    
    print(f"✅ Generated lesson: {lesson.title}")
    print(f"   Steps: {len(lesson.steps)}")
    for i, step in enumerate(lesson.steps, 1):
        print(f"   {i}. {step}")
    
    # Step 2: Generate audio
    print("\n🎵 Step 2: Generating audio with ElevenLabs...")
    if hasattr(lesson, 'narration_script') and lesson.narration_script:
        script = lesson.narration_script
    else:
        script = f"Welcome to this math lesson. {lesson.title}. " + " ".join(lesson.steps)
    
    audio_path = generate_audio(script, output_name)
    
    # Step 3: Create demo video
    print("\n🎬 Step 3: Creating demo video...")
    video_path = create_demo_video(lesson, output_name)
    
    # Step 4: Combine video and audio
    if video_path and audio_path:
        print("\n🔄 Step 4: Combining video and audio...")
        final_video = combine_video_audio(video_path, audio_path, output_name)
        
        print(f"\n🎉 SUCCESS! Complete lesson created!")
        print(f"📁 Final video: {final_video}")
        print(f"📊 File size: {final_video.stat().st_size / 1024 / 1024:.2f} MB")
    else:
        print("\n⚠️ Demo completed with partial results")
        if video_path:
            print(f"📁 Video only: {video_path}")
        if audio_path:
            print(f"🎵 Audio only: {audio_path}")

if __name__ == "__main__":
    main()
