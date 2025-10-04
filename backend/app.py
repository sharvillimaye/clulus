from flask import Flask, jsonify, request, send_from_directory, send_file
from flask_cors import CORS
import base64
import io
import json
import os
import subprocess
import sys
import uuid
from pathlib import Path
from PIL import Image
import time

# Add the video_generator directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'video_generator'))

# Import video generation modules (with error handling)
try:
    from video_generator.llm_client import ask_llm
    from video_generator.lesson_schema import Lesson
    VIDEO_GENERATION_AVAILABLE = True
except Exception as e:
    print(f"Warning: Video generation not available: {e}")
    VIDEO_GENERATION_AVAILABLE = False
    ask_llm = None
    Lesson = None

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, origins=['http://localhost:3000'])

VIDEO_DIR = './video_generator/media/videos/render_scene/1080p60'
BUILD_DIR = './video_generator/build'

# Ensure directories exist
os.makedirs(BUILD_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)

def compile_manim(json_path: Path, quality: str = "h", out_name: str = None) -> Path:
    """Compile Manim video from lesson JSON"""
    assert json_path.exists()
    out_name = out_name or "lesson"
    
    env = os.environ.copy()
    # Make 100% sure TeX is on PATH for the manim subprocess
    texbin = "/Library/TeX/texbin"
    env["PATH"] = f"{texbin}:{env.get('PATH','')}"
    env["LESSON_JSON"] = str(json_path.resolve())

    cmd = [
        "manim", f"-q{quality}", "-o", out_name,
        "render_scene.py", "LessonScene",
        "--disable_caching"
    ]
    print("Running:", " ".join(cmd))
    print("LESSON_JSON:", env["LESSON_JSON"])
    
    # Change to video_generator directory for manim command
    original_cwd = os.getcwd()
    video_gen_dir = os.path.join(os.path.dirname(__file__), 'video_generator')
    try:
        os.chdir(video_gen_dir)
        proc = subprocess.run(cmd, env=env, capture_output=True, text=True)
        print("Manim stdout:", proc.stdout)
        print("Manim stderr:", proc.stderr)
        if proc.returncode != 0:
            raise RuntimeError(f"Manim render failed. Return code: {proc.returncode}, stderr: {proc.stderr}")
    finally:
        os.chdir(original_cwd)
    
    # Manim creates videos in media/videos/render_scene/1080p60/ directory
    manim_output_dir = os.path.join(video_gen_dir, "media", "videos", "render_scene", "1080p60")
    out_path = Path(manim_output_dir) / f"{out_name}.mp4"
    
    # Check if the video was actually created
    if not out_path.exists():
        raise RuntimeError(f"Video file was not created at {out_path}")
    
    return out_path

# Route to get a video by filename
@app.route('/get_video/<filename>')
def get_video(filename):
    return send_from_directory(VIDEO_DIR, filename)

# New endpoint to generate video from math question
@app.route('/generate_video', methods=['POST'])
def generate_video():
    if not VIDEO_GENERATION_AVAILABLE:
        return jsonify({
            'error': 'Video generation not available',
            'details': 'Required dependencies or API keys not configured'
        }), 503
    
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({'error': 'Question is required'}), 400
        
        question = data['question'].strip()
        if not question:
            return jsonify({'error': 'Question cannot be empty'}), 400
        
        # Generate unique filename for this request
        video_id = str(uuid.uuid4())
        json_filename = f"lesson_{video_id}.json"
        video_filename = f"lesson_{video_id}.mp4"
        
        json_path = Path(BUILD_DIR) / json_filename
        video_path = Path(BUILD_DIR) / video_filename
        
        # Step 1: Generate lesson JSON using LLM
        try:
            json_str = ask_llm(question)
        except RuntimeError as e:
            if "GEMINI_KEY" in str(e):
                return jsonify({
                    'error': 'Gemini API key not configured. Please set GEMINI_KEY environment variable.',
                    'details': 'Create a .env file in the project root with: GEMINI_KEY=your_api_key_here'
                }), 500
            else:
                raise
        
        # Step 2: Validate schema
        lesson_data = json.loads(json_str)
        lesson = Lesson.model_validate(lesson_data)
        
        # Step 3: Save JSON for Manim to read
        with open(json_path, "w") as f:
            json.dump(lesson.model_dump(), f, indent=2)
        
        # Step 4: Compile to video
        try:
            mp4_path = compile_manim(json_path, quality="h", out_name=f"lesson_{video_id}")
            
            # Check if video was created successfully
            if not mp4_path.exists():
                return jsonify({'error': 'Video generation failed'}), 500
            
            # Return the video file as a stream (not as attachment)
            return send_file(
                mp4_path,
                as_attachment=False,
                mimetype='video/mp4',
                add_etags=False
            )
            
        except Exception as e:
            return jsonify({'error': f'Video compilation failed: {str(e)}'}), 500
        
    except Exception as e:
        return jsonify({'error': f'Video generation failed: {str(e)}'}), 500

# Alternative endpoint that returns video as base64 blob
@app.route('/generate_video_blob', methods=['POST'])
def generate_video_blob():
    if not VIDEO_GENERATION_AVAILABLE:
        return jsonify({
            'error': 'Video generation not available',
            'details': 'Required dependencies or API keys not configured'
        }), 503
    
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({'error': 'Question is required'}), 400
        
        question = data['question'].strip()
        if not question:
            return jsonify({'error': 'Question cannot be empty'}), 400
        
        # Generate unique filename for this request
        video_id = str(uuid.uuid4())
        json_filename = f"lesson_{video_id}.json"
        
        json_path = Path(BUILD_DIR) / json_filename
        
        # Step 1: Generate lesson JSON using LLM
        try:
            json_str = ask_llm(question)
        except RuntimeError as e:
            if "GEMINI_KEY" in str(e):
                return jsonify({
                    'error': 'Gemini API key not configured. Please set GEMINI_KEY environment variable.',
                    'details': 'Create a .env file in the project root with: GEMINI_KEY=your_api_key_here'
                }), 500
            else:
                raise
        
        # Step 2: Validate schema
        lesson_data = json.loads(json_str)
        lesson = Lesson.model_validate(lesson_data)
        
        # Step 3: Save JSON for Manim to read
        with open(json_path, "w") as f:
            json.dump(lesson.model_dump(), f, indent=2)
        
        # Step 4: Compile to video
        try:
            mp4_path = compile_manim(json_path, quality="h", out_name=f"lesson_{video_id}")
            
            # Check if video was created successfully
            if not mp4_path.exists():
                return jsonify({'error': 'Video generation failed'}), 500
            
            # Read video file and encode as base64
            with open(mp4_path, 'rb') as video_file:
                video_data = video_file.read()
                video_base64 = base64.b64encode(video_data).decode('utf-8')
            
            # Clean up temporary files
            try:
                os.remove(json_path)
                os.remove(mp4_path)
            except:
                pass  # Ignore cleanup errors
            
            return jsonify({
                'success': True,
                'video_blob': video_base64,
                'mimetype': 'video/mp4',
                'size': len(video_data)
            })
            
        except Exception as e:
            return jsonify({'error': f'Video compilation failed: {str(e)}'}), 500
        
    except Exception as e:
        return jsonify({'error': f'Video generation failed: {str(e)}'}), 500

# Create directory for storing processed images
UPLOAD_DIR = 'processed_images'
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.route('/')
def hello_world():
    return jsonify({
        'message': 'Hello, World!',
        'status': 'success'
    })

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'flask-backend',
        'video_generation': 'ready' if VIDEO_GENERATION_AVAILABLE else 'not_available',
        'endpoints': {
            'generate_video': 'POST /generate_video - Generate Manim video (stream response)',
            'generate_video_blob': 'POST /generate_video_blob - Generate Manim video (base64 blob)',
            'get_video': 'GET /get_video/<filename> - Get video by filename',
            'health': 'GET /health - Health check'
        }
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
