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

## Example Usage

```bash
# Hello world endpoint
curl http://localhost:5000/

# Health check
curl http://localhost:5000/health
```
