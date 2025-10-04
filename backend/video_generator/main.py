# main.py
import os, json, subprocess, sys, uuid, shutil
from pathlib import Path
from llm_client import ask_llm
from lesson_schema import Lesson

BUILD = Path("build")
BUILD.mkdir(exist_ok=True)

# ElevenLabs integration
try:
    import elevenlabs
    ELEVENLABS_AVAILABLE = True
    print("✅ ElevenLabs is available!")
except ImportError:
    ELEVENLABS_AVAILABLE = False
    print("⚠️ ElevenLabs not installed. Install with: pip install elevenlabs")

def compile_manim(json_path: Path, quality: str = "h", out_name: str = None) -> Path:
    assert json_path.exists()
    out_name = out_name or "lesson"
    out_path = BUILD / f"{out_name}.mp4"

    env = os.environ.copy()
    # Make 100% sure TeX is on PATH for the manim subprocess
    texbin = "/Library/TeX/texbin"
    env["PATH"] = f"{texbin}:{env.get('PATH','')}"
    env["LESSON_JSON"] = str(json_path.resolve())

    # Use full path to manim
    manim_path = "/Users/gravitbali/Library/Python/3.9/bin/manim"
    cmd = [
        manim_path, f"-q{quality}", "-o", out_path.name,
        "render_scene.py", "LessonScene",
        "--disable_caching"
    ]
    print("Running:", " ".join(cmd))
    proc = subprocess.run(cmd, env=env)
    if proc.returncode != 0:
        raise RuntimeError("Manim render failed.")
    return out_path

def generate_audio(script: str, output_name: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM") -> Path:
    """Generate audio using ElevenLabs."""
    if not ELEVENLABS_AVAILABLE:
        print("❌ ElevenLabs not available. Install with: pip install elevenlabs")
        # Create placeholder file
        audio_path = BUILD / f"{output_name}_audio.mp3"
        with open(audio_path, 'w') as f:
            f.write("# Placeholder audio file")
        return audio_path
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv("../../.env")
    
    ELEVENLABS_KEY = os.getenv("ELEVENLABS_KEY")
    if not ELEVENLABS_KEY:
        print("⚠️ ELEVENLABS_KEY not set. Creating placeholder audio file.")
        audio_path = BUILD / f"{output_name}_audio.mp3"
        with open(audio_path, 'w') as f:
            f.write("# Placeholder audio file - set ELEVENLABS_KEY for real audio")
        return audio_path
    
    try:
        print("🎵 Generating audio with ElevenLabs...")
        
        # Use direct API call with requests
        import requests
        
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_KEY
        }
        
        data = {
            "text": script,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            audio_path = BUILD / f"{output_name}_audio.mp3"
            with open(audio_path, "wb") as f:
                f.write(response.content)
            print(f"✅ Audio generated: {audio_path}")
            return audio_path
        else:
            print(f"❌ ElevenLabs API error: {response.status_code} - {response.text}")
            # Create placeholder file
            audio_path = BUILD / f"{output_name}_audio.mp3"
            with open(audio_path, 'w') as f:
                f.write("# Audio generation failed")
            return audio_path
        
    except Exception as e:
        print(f"❌ Audio generation failed: {e}")
        # Create placeholder file
        audio_path = BUILD / f"{output_name}_audio.mp3"
        with open(audio_path, 'w') as f:
            f.write("# Audio generation failed")
        return audio_path

def combine_video_audio(video_path: Path, audio_path: Path, output_name: str) -> Path:
    """Combine video and audio using FFmpeg."""
    try:
        print("🔄 Combining video and audio...")
        
        final_path = BUILD / f"{output_name}_final.mp4"
        
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
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Combined video created: {final_path}")
            return final_path
        else:
            print(f"❌ FFmpeg failed: {result.stderr}")
            return video_path  # Return original video if combination fails
            
    except FileNotFoundError:
        print("❌ FFmpeg not found. Install with: brew install ffmpeg")
        return video_path  # Return original video if FFmpeg not available
    except Exception as e:
        print(f"❌ Video combination failed: {e}")
        return video_path

def main():
    # Check if user wants audio
    with_audio = len(sys.argv) > 1 and sys.argv[1] == "--with-audio"
    if with_audio:
        args = sys.argv[2:]
    else:
        args = sys.argv[1:]
    
    # (1) Ask user
    if args:
        question = " ".join(args)
    else:
        question = input("Enter a math question: ").strip()

    # Generate unique output name
    import time
    output_name = f"lesson_{int(time.time())}"

    print(f"🎯 Generating lesson: {question}")
    if with_audio:
        print("🎵 Including audio narration")

    # (2) LLM → JSON
    json_str = ask_llm(question)

    # (3) Validate schema
    data = json.loads(json_str)
    lesson = Lesson.model_validate(data)

    # Save JSON for the scene to read
    json_path = BUILD / f"{output_name}.json"
    with open(json_path, "w") as f:
        json.dump(lesson.model_dump(), f, indent=2)

    # (4) Generate video and audio simultaneously
    print("🎬 Generating video with Manim...")
    video_path = compile_manim(json_path, quality="h", out_name=output_name)
    print(f"✅ Video generated: {video_path}")

    if with_audio:
        # (5) Generate audio
        if hasattr(lesson, 'narration_script') and lesson.narration_script:
            script = lesson.narration_script
        else:
            # Fallback: create simple script from steps
            script = f"Welcome to this math lesson. {lesson.title}. " + " ".join(lesson.steps)
        
        audio_path = generate_audio(script, output_name)
        
        # (6) Combine video and audio
        final_video = combine_video_audio(video_path, audio_path, output_name)
        print(f"\n🎉 Complete lesson with audio: {final_video}")
    else:
        print(f"\n✅ Video-only lesson: {video_path}")
        print("💡 Add --with-audio flag to include narration")

if __name__ == "__main__":
    main()
