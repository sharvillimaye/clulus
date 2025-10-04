#!/usr/bin/env python3
"""
Test Manim video generation with math problem
"""

import os
import json
import subprocess
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

def test_manim_math():
    """Test Manim video generation with a math problem."""
    
    print("🎬 Testing Manim Video Generation with Math Problem")
    print("=" * 60)
    
    # Create test lesson data
    lesson_data = {
        "title": "Derivative of $x^2 + 3x$",
        "steps": [
            "f(x) = x^2 + 3x",
            "f'(x) = \\frac{d}{dx}(x^2) + \\frac{d}{dx}(3x)",
            "f'(x) = 2x + 3"
        ],
        "function_tex": "x^2 + 3x",
        "x_min": -3.0,
        "x_max": 3.0,
        "narration_script": "Welcome to this math lesson. Today we will find the derivative of x squared plus 3x."
    }
    
    print("📝 Test lesson data:")
    print(f"Title: {lesson_data['title']}")
    print(f"Steps: {len(lesson_data['steps'])}")
    for i, step in enumerate(lesson_data['steps'], 1):
        print(f"  {i}. {step}")
    print()
    
    # Create build directory
    build_dir = Path("build")
    build_dir.mkdir(exist_ok=True)
    
    # Save lesson JSON
    json_path = build_dir / "test_lesson.json"
    with open(json_path, 'w') as f:
        json.dump(lesson_data, f, indent=2)
    
    print(f"💾 Saved lesson JSON: {json_path}")
    
    # Test Manim compilation
    try:
        print("🎬 Testing Manim compilation...")
        
        # Set up environment
        env = os.environ.copy()
        texbin = "/Library/TeX/texbin"
        env["PATH"] = f"{texbin}:{env.get('PATH','')}"
        env["LESSON_JSON"] = str(json_path.resolve())
        
        # Manim command (use full path)
        manim_path = "/Users/gravitbali/Library/Python/3.9/bin/manim"
        cmd = [
            manim_path, "-qh", "-o", "test_lesson.mp4",
            "render_scene.py", "LessonScene",
            "--disable_caching"
        ]
        
        print(f"Running: {' '.join(cmd)}")
        print(f"Environment: LESSON_JSON={env['LESSON_JSON']}")
        
        # Run Manim
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Manim compilation successful!")
            
            # Check for output file
            output_files = list(build_dir.glob("test_lesson*.mp4"))
            if output_files:
                video_file = output_files[0]
                file_size = video_file.stat().st_size
                print(f"📁 Video generated: {video_file}")
                print(f"📊 Size: {file_size:,} bytes ({file_size/1024/1024:.1f} MB)")
                print()
                print("🎉 Manim video generation is working!")
                print("🎬 You can now play the video file to see the math lesson.")
                return True
            else:
                print("⚠️ Manim ran successfully but no video file found")
                return False
        else:
            print(f"❌ Manim compilation failed:")
            print(f"Return code: {result.returncode}")
            print(f"STDOUT: {result.stdout}")
            print(f"STDERR: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("❌ Manim command not found")
        print("💡 Try installing Manim: pip install manim")
        return False
    except Exception as e:
        print(f"❌ Error running Manim: {e}")
        return False

if __name__ == "__main__":
    test_manim_math()
