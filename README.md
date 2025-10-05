# Clulus: HackHarvard 2025 Submission

<div align="center">
	<a href="https://devpost.com/software/clulus" target="_blank">
		<img src="https://img.shields.io/badge/Devpost-View%20Project-blue" alt="Devpost" />
	</a>
	<br><br>
	<a href="https://youtu.be/0p0-whvrhEc" target="_blank">
		<img src="https://img.youtube.com/vi/0p0-whvrhEc/0.jpg" alt="Watch Demo" width="480"/>
	</a>
	<br>
	<a href="https://youtu.be/0p0-whvrhEc" target="_blank"><b>Watch our YouTube Demo</b></a>
</div>

---

## Overview

Clulus is an AI-powered platform designed to revolutionize learning by generating interactive video lessons from text, images, and LaTeX. Built for HackHarvard 2025, Clulus combines a Next.js frontend with a Python backend leveraging LLMs and generative media.

## Features
- **AI Lesson Generation:** Converts lesson plans into engaging videos
- **Image & LaTeX Rendering:** Supports mathematical notation and diagrams
- **Customizable Scenes:** Modular video creation pipeline
- **Modern Frontend:** Built with Next.js and TypeScript
- **RESTful Backend:** Python FastAPI server for lesson processing

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend/clulus
pnpm install
pnpm dev
```

## Repository Structure
- `backend/` — Python backend for lesson generation
- `frontend/clulus/` — Next.js frontend app

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
