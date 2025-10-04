"use client";

import { useWebcam } from "../hooks/useWebcam";

export default function WebcamFeed() {
  const {
    videoRef,
    isStreaming,
    error,
    startWebcam,
    stopWebcam,
    hasWebcam,
    sentimentResults,
    isAnalyzing,
  } = useWebcam();

  const handleStartWebcam = () => {
    console.log("Start webcam button clicked");
    startWebcam();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Live Webcam Feed
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Video Container */}
          <div className="relative bg-black rounded-lg overflow-hidden mb-6">
            <video
              ref={videoRef}
              className="w-full h-auto max-h-[600px] object-cover"
              autoPlay
              playsInline
              muted
            />
            {!isStreaming && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                  <div className="text-6xl mb-4">📹</div>
                  <p className="text-xl">Click "Start Webcam" to begin</p>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900 text-white">
                <div className="text-center p-4">
                  <div className="text-6xl mb-4">❌</div>
                  <p className="text-xl mb-2">Webcam Error</p>
                  <p className="text-sm opacity-80">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isStreaming ? (
              <button
                onClick={handleStartWebcam}
                disabled={!!error}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <span>📹</span>
                Start Webcam
              </button>
            ) : (
              <button
                onClick={stopWebcam}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <span>⏹️</span>
                Stop Webcam
              </button>
            )}

            {isStreaming && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Live</span>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Analyzing...</span>
              </div>
            )}
          </div>

          {/* Status Info */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {!hasWebcam && !error && (
              <p>Your browser will ask for permission to access your webcam</p>
            )}
            {hasWebcam && !isStreaming && (
              <p>
                Webcam is available. Click "Start Webcam" to begin streaming.
              </p>
            )}
            {isStreaming && (
              <p>Webcam is active. Click "Stop Webcam" to end the stream.</p>
            )}
          </div>
        </div>

        {/* Sentiment Analysis Results */}
        {sentimentResults.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Sentiment Analysis Results
            </h2>
            <div className="space-y-3">
              {sentimentResults
                .slice()
                .reverse()
                .map((result, index) => (
                  <div
                    key={result.timestamp}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          result.sentiment === "positive"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : result.sentiment === "negative"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {result.sentiment}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Confidence: {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
