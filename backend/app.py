from flask import Flask, jsonify, request
import base64
import io
from PIL import Image
import time
import os

app = Flask(__name__)

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
        'service': 'flask-backend'
    })

@app.route('/process-image', methods=['POST'])
def process_image():
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No JSON data provided',
                'status': 'error'
            }), 400
        
        # Extract image and timestamp
        image_data = data.get('image')
        timestamp = data.get('timestamp')
        
        if not image_data:
            return jsonify({
                'error': 'No image data provided',
                'status': 'error'
            }), 400
        
        if not timestamp:
            return jsonify({
                'error': 'No timestamp provided',
                'status': 'error'
            }), 400
        
        # Process the base64 image
        processed_info = process_base64_image(image_data, timestamp)
        
        return jsonify({
            'message': 'Image processed successfully',
            'status': 'success',
            'processed_info': processed_info
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Error processing image: {str(e)}',
            'status': 'error'
        }), 500

def process_base64_image(image_data, timestamp):
    """
    Process a base64 encoded image and return information about it
    """
    try:
        # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        
        # Open image with PIL
        image = Image.open(io.BytesIO(image_bytes))
        
        # Get image information
        width, height = image.size
        format = image.format
        mode = image.mode
        
        # Convert timestamp to readable format
        readable_time = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(timestamp))
        
        # Save processed image with timestamp
        filename = f"image_{timestamp}_{int(time.time())}.{format.lower()}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        image.save(filepath)
        
        return {
            'filename': filename,
            'filepath': filepath,
            'dimensions': f"{width}x{height}",
            'format': format,
            'mode': mode,
            'timestamp': timestamp,
            'readable_time': readable_time,
            'file_size': len(image_bytes)
        }
        
    except Exception as e:
        raise Exception(f"Failed to process image: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
