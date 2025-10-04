# Flask Backend

A simple Flask backend application with basic endpoints.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

Start the Flask development server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## Endpoints

- `GET /` - Returns a hello world message
- `GET /health` - Health check endpoint
- `POST /process-image` - Process base64 encoded images

## Example Usage

```bash
# Hello world endpoint
curl http://localhost:8080/

# Health check
curl http://localhost:8080/health

# Process image (example with base64 data)
curl -X POST http://localhost:8080/process-image \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUA...",
    "timestamp": 1699123456
  }'
```

## Image Processing

The `/process-image` endpoint accepts JSON requests with:
- `image`: Base64 encoded image (with or without data URL prefix)
- `timestamp`: Unix timestamp

The endpoint will:
- Decode the base64 image
- Extract image metadata (dimensions, format, etc.)
- Save the image to `processed_images/` directory
- Return processing information

Images are saved with filenames like: `image_{timestamp}_{current_time}.{format}`
