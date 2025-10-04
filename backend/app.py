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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
