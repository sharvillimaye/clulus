"use client";

import React, { useState, useCallback } from "react";

interface VideoResponse {
  success: boolean;
  video_blob: string;
  mimetype: string;
  size: number;
}

interface MathVideoPlayerProps {
  question: string;
  className?: string;
  autoGenerate?: boolean;
}

export default function MathVideoPlayer({
  question,
  className = "",
  autoGenerate = false,
}: MathVideoPlayerProps) {
  const [videoBlob, setVideoBlob] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  const generateVideo = useCallback(async (mathQuestion: string) => {
    if (!mathQuestion.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:8080/generate_video_blob",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: mathQuestion }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: VideoResponse = await response.json();

      if (data.success) {
        setVideoBlob(data.video_blob);
        setShowVideo(true);
      } else {
        throw new Error("Video generation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Video generation error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearVideo = useCallback(() => {
    setVideoBlob(null);
    setShowVideo(false);
    setError(null);
  }, []);

  // Auto-generate video when question changes and autoGenerate is true
  React.useEffect(() => {
    if (autoGenerate && question.trim()) {
      generateVideo(question);
    }
  }, [question, autoGenerate, generateVideo]);

  return (
    <div className={`math-video-player ${className}`}>
      {/* Controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => generateVideo(question)}
          disabled={loading || !question.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Video...
            </span>
          ) : (
            "Generate Math Animation"
          )}
        </button>

        {videoBlob && (
          <button
            onClick={clearVideo}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Video
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Video Player */}
      {showVideo && videoBlob && (
        <div className="video-container bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Math Animation
            </h3>
            <button
              onClick={() => setShowVideo(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <video
            controls
            width="100%"
            height="400"
            className="rounded-lg border border-gray-200"
            autoPlay
            muted
          >
            <source
              src={`data:video/mp4;base64,${videoBlob}`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>

          <div className="mt-2 text-sm text-gray-600">
            Generated animation for: <em>{question}</em>
          </div>
        </div>
      )}
    </div>
  );
}
