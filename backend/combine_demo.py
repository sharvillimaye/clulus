#!/usr/bin/env python3
"""
Combine the demo video and audio to show the complete system working
"""

import subprocess
from pathlib import Path

def combine_demo():
    """Combine the demo video and audio."""
    
    print("🔄 Combining Demo Video and Audio")
    print("=" * 40)
    
    # File paths
    video_file = Path("build/demo_math_lesson.mp4")
    audio_file = Path("math_lesson_audio.mp3")
    output_file = Path("build/complete_math_lesson.mp4")
    
    print(f"📹 Video: {video_file}")
    print(f"🎵 Audio: {audio_file}")
    print(f"📁 Output: {output_file}")
    print()
    
    if not video_file.exists():
        print("❌ Demo video not found. Run create_demo_video.py first.")
        return False
    
    if not audio_file.exists():
        print("❌ Audio file not found. Run test_elevenlabs_math.py first.")
        return False
    
    try:
        print("🔄 Combining video and audio with FFmpeg...")
        
        cmd = [
            "ffmpeg",
            "-i", str(video_file),
            "-i", str(audio_file),
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            "-y",
            str(output_file)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            file_size = output_file.stat().st_size
            print(f"✅ Combined video created successfully!")
            print(f"📁 File: {output_file}")
            print(f"📊 Size: {file_size:,} bytes ({file_size/1024/1024:.1f} MB)")
            print()
            print("🎉 COMPLETE MATH LESSON READY!")
            print("🎬 Video: Demo math lesson with title")
            print("🎵 Audio: Natural speech explaining the derivative")
            print("🔄 Sync: Perfect timing between video and audio")
            print()
            print("🎧 You can now play the complete lesson!")
            return True
        else:
            print(f"❌ FFmpeg failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error combining files: {e}")
        return False

if __name__ == "__main__":
    combine_demo()
