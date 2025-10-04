#!/usr/bin/env python3
"""
Create a demo video using FFmpeg to show what a math lesson video would look like
"""

import subprocess
import os
from pathlib import Path

def create_demo_video():
    """Create a demo video showing math lesson content."""
    
    print("🎬 Creating Demo Math Lesson Video with FFmpeg")
    print("=" * 50)
    
    # Create build directory
    build_dir = Path("build")
    build_dir.mkdir(exist_ok=True)
    
    # Demo video content
    title = "Derivative of x² + 3x"
    steps = [
        "Step 1: f(x) = x² + 3x",
        "Step 2: f'(x) = d/dx(x²) + d/dx(3x)", 
        "Step 3: f'(x) = 2x + 3"
    ]
    
    print(f"📝 Creating video for: {title}")
    print("📊 Steps:")
    for step in steps:
        print(f"  {step}")
    print()
    
    try:
        # Create a simple video with text overlays
        output_file = build_dir / "demo_math_lesson.mp4"
        
        # FFmpeg command to create a video with text overlays
        cmd = [
            "ffmpeg",
            "-f", "lavfi",
            "-i", "color=c=blue:size=1280x720:duration=10",
            "-vf", f"drawtext=text='{title}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=100:fontfile=/System/Library/Fonts/Arial.ttf",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-y",
            str(output_file)
        ]
        
        print("🎬 Generating demo video...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            file_size = output_file.stat().st_size
            print(f"✅ Demo video created successfully!")
            print(f"📁 File: {output_file}")
            print(f"📊 Size: {file_size:,} bytes ({file_size/1024/1024:.1f} MB)")
            print()
            print("🎉 Demo video is ready!")
            print("🎬 This shows what a math lesson video would look like")
            print("💡 Once Manim is working, it will create much more sophisticated animations")
            return True
        else:
            print(f"❌ FFmpeg failed: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("❌ FFmpeg not found. Install with: brew install ffmpeg")
        return False
    except Exception as e:
        print(f"❌ Error creating demo video: {e}")
        return False

if __name__ == "__main__":
    create_demo_video()
