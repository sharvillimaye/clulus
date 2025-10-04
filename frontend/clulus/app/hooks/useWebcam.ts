'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface SentimentResult {
  sentiment: string;
  confidence: number;
  timestamp: number;
}

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  error: string | null;
  startWebcam: () => Promise<void>;
  stopWebcam: () => void;
  hasWebcam: boolean;
  sentimentResults: SentimentResult[];
  isAnalyzing: boolean;
}

export const useWebcam = (): UseWebcamReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasWebcam, setHasWebcam] = useState(false);
  const [sentimentResults, setSentimentResults] = useState<SentimentResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Function to capture frame and send to backend
  const captureAndAnalyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    try {
      setIsAnalyzing(true);
      
      // Send frame to Python backend for sentiment analysis
      const response = await fetch('http://localhost:8000/analyze-sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          timestamp: Date.now()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SentimentResult = await response.json();
      
      // Add result to the list (keep only last 10 results)
      setSentimentResults(prev => {
        const newResults = [...prev, result];
        return newResults.slice(-10);
      });

      console.log('Sentiment analysis result:', result);
    } catch (err) {
      console.error('Error analyzing frame:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Function to start frame capture loop
  const startFrameCapture = useCallback(() => {
    if (frameIntervalRef.current) return; // Already running

    // Create canvas element for frame capture
    canvasRef.current = document.createElement('canvas');
    
    // Capture frames at 2 FPS (every 500ms)
    frameIntervalRef.current = setInterval(captureAndAnalyzeFrame, 500);
    console.log('Started frame capture at 2 FPS');
  }, [captureAndAnalyzeFrame]);

  // Function to stop frame capture loop
  const stopFrameCapture = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
      console.log('Stopped frame capture');
    }
  }, []);

  const startWebcam = useCallback(async () => {
    try {
      console.log('Starting webcam...');
      setError(null);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam access is not supported in this browser');
      }

      console.log('Requesting webcam access...');
      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      console.log('Webcam access granted, setting up stream...');
      streamRef.current = stream;
      setHasWebcam(true);
      setIsStreaming(true);

      // Set the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        console.log('Video element updated with stream');
        
        // Start frame capture after video starts playing
        videoRef.current.onloadedmetadata = () => {
          startFrameCapture();
        };
      } else {
        console.warn('Video ref is null');
      }
    } catch (err) {
      console.error('Webcam error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to access webcam';
      setError(errorMessage);
      setIsStreaming(false);
      setHasWebcam(false);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    // Stop frame capture first
    stopFrameCapture();
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stopFrameCapture]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return {
    videoRef,
    isStreaming,
    error,
    startWebcam,
    stopWebcam,
    hasWebcam,
    sentimentResults,
    isAnalyzing
  };
};
