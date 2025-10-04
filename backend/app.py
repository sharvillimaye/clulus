from flask import Flask, jsonify, request, send_file
import base64
import io
import json
import time
import os
import sys
from pathlib import Path
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

# Add video_generator to path
sys.path.append(str(Path(__file__).parent / "video_generator"))

app = Flask(__name__)

# Create directories
UPLOAD_DIR = 'processed_images'
BUILD_DIR = Path('build')
UPLOAD_DIR = Path(UPLOAD_DIR)
UPLOAD_DIR.mkdir(exist_ok=True)
BUILD_DIR.mkdir(exist_ok=True)

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
        'service': 'flask-backend'
    })

@app.route('/generate-audio', methods=['POST'])
def generate_audio():
    """Generate audio using ElevenLabs and return the MP3 file."""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Missing required field: text'}), 400
        
        text = data['text']
        voice_id = data.get('voice_id', '21m00Tcm4TlvDq8ikWAM')
        
        # Import the audio generation function
        from video_generator.main import generate_audio
        
        # Generate unique ID
        audio_id = f"audio_{int(time.time())}"
        
        print(f"Generating audio for: {text[:50]}...")
        
        # Generate audio
        audio_path = generate_audio(text, audio_id, voice_id)
        
        if audio_path and audio_path.exists():
            return send_file(
                audio_path, 
                as_attachment=True, 
                download_name=f"{audio_id}.mp3",
                mimetype='audio/mpeg'
            )
        else:
            return jsonify({'error': 'Failed to generate audio'}), 500
        
    except Exception as e:
        print(f"Error generating audio: {e}")
        return jsonify({'error': f'Failed to generate audio: {str(e)}'}), 500

@app.route('/generate-lesson', methods=['POST'])
def generate_lesson():
    """Generate a complete math lesson with video and audio."""
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({'error': 'Missing required field: question'}), 400
        
        question = data['question']
        with_audio = data.get('with_audio', True)
        voice_id = data.get('voice_id', '21m00Tcm4TlvDq8ikWAM')
        
        # Import the video generator functions
        from video_generator.llm_client import ask_llm
        from video_generator.lesson_schema import Lesson
        from video_generator.main import compile_manim, generate_audio, combine_video_audio
        
        # Generate unique ID
        lesson_id = f"lesson_{int(time.time())}"
        
        print(f"Generating lesson: {question}")
        
        # Generate lesson content
        json_str = ask_llm(question)
        lesson_data = json.loads(json_str)
        lesson = Lesson.model_validate(lesson_data)
        
        # Save lesson JSON
        json_path = BUILD_DIR / f"{lesson_id}.json"
        with open(json_path, 'w') as f:
            json.dump(lesson.model_dump(), f, indent=2)
        
        # Generate Manim video
        print("🎬 Generating video with Manim...")
        try:
            video_path = compile_manim(json_path, quality="h", out_name=lesson_id)
            if video_path and video_path.exists():
                result = {
                    'status': 'success',
                    'lesson_id': lesson_id,
                    'lesson_data': lesson.model_dump(),
                    'video_url': f'/download/{video_path.name}',
                    'message': 'Video generated successfully'
                }
            else:
                result = {
                    'status': 'error',
                    'lesson_id': lesson_id,
                    'lesson_data': lesson.model_dump(),
                    'message': 'Video generation failed'
                }
        except Exception as e:
            print(f"❌ Manim video generation failed: {e}")
            result = {
                'status': 'error',
                'lesson_id': lesson_id,
                'lesson_data': lesson.model_dump(),
                'message': f'Video generation failed: {str(e)}'
            }
        
        if with_audio:
            # Generate audio
            if hasattr(lesson, 'narration_script') and lesson.narration_script:
                script = lesson.narration_script
            else:
                script = f"Welcome to this math lesson. {lesson.title}. " + " ".join(lesson.steps)
            
            audio_path = generate_audio(script, lesson_id, voice_id)
            if audio_path and audio_path.exists():
                result['audio_url'] = f'/download/{audio_path.name}'
                result['message'] += ' with audio'
                
                # If we have both video and audio, combine them
                if 'video_url' in result:
                    try:
                        final_video = combine_video_audio(video_path, audio_path, lesson_id)
                        if final_video and final_video.exists():
                            result['final_video_url'] = f'/download/{final_video.name}'
                            result['message'] = 'Complete lesson with synchronized video and audio generated'
                    except Exception as e:
                        print(f"❌ Video-audio combination failed: {e}")
                        result['message'] += ' (combination failed)'
            else:
                result['message'] += ' (audio failed)'
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error generating lesson: {e}")
        return jsonify({'error': f'Failed to generate lesson: {str(e)}'}), 500

@app.route('/ask', methods=['POST'])
def ask_question():
    """Ask any question and get back a short audio response (max 10 seconds)."""
    try:
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({'error': 'Missing required field: question'}), 400
        
        question = data['question']
        voice_id = data.get('voice_id', '21m00Tcm4TlvDq8ikWAM')
        
        # Generate unique ID
        lesson_id = f"audio_{int(time.time())}"
        
        print(f"🎯 User asked: {question}")
        
        # Create a concise response (aim for ~8-10 seconds of speech)
        # For math questions, give a brief explanation
        if any(word in question.lower() for word in ['derivative', 'integral', 'solve', 'find', 'calculate', 'math', 'equation']):
            # Generate lesson content for math questions
            from video_generator.llm_client import ask_llm
            from video_generator.lesson_schema import Lesson
            
            json_str = ask_llm(question)
            lesson_data = json.loads(json_str)
            lesson = Lesson.model_validate(lesson_data)
            
            # Create short script (max 10 seconds = ~25-30 words)
            if hasattr(lesson, 'narration_script') and lesson.narration_script:
                script = lesson.narration_script
            else:
                # Create a very brief explanation
                script = f"To solve {question.lower()}: {lesson.steps[0] if lesson.steps else 'Apply the appropriate mathematical rule.'}"
            
            # Truncate if too long (roughly 30 words max for 10 seconds)
            words = script.split()
            if len(words) > 30:
                script = " ".join(words[:30]) + "..."
        else:
            # For non-math questions, create a simple response
            script = f"Here's a brief answer to your question: {question}. This is a short response as requested."
        
        print(f"🎵 Generating short audio: {script[:50]}...")
        
        # Generate audio using the existing function
        from video_generator.main import generate_audio
        audio_path = generate_audio(script, lesson_id, voice_id)
        
        if audio_path and audio_path.exists():
            # Return the audio file directly
            return send_file(
                audio_path, 
                as_attachment=True, 
                download_name=f"{lesson_id}.mp3",
                mimetype='audio/mpeg'
            )
        else:
            return jsonify({'error': 'Failed to generate audio'}), 500
        
    except Exception as e:
        print(f"Error processing question: {e}")
        return jsonify({'error': f'Failed to process question: {str(e)}'}), 500

@app.route('/download/<filename>')
def download_file(filename):
    """Download generated files."""
    try:
        file_path = BUILD_DIR / filename
        if not file_path.exists():
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(file_path, as_attachment=True, download_name=filename)
        
    except Exception as e:
        return jsonify({'error': f'Failed to download file: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8087)
