"use client";

import React from "react";
import { useWebcam } from "../hooks/useWebcam";
import ConfusionModal from "./ConfusionModal";

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
    showConfusionModal,
    dismissConfusionModal,
  } = useWebcam();

  // Test state for modal - remove in production
  const [testModalOpen, setTestModalOpen] = React.useState(false);

  const handleStartWebcam = () => {
    console.log("Start webcam button clicked");
    startWebcam();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
          Confusion Detection
        </h2>
      </div>

      <div className="flex-1 p-4">
        {/* Video Container */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            className="w-full h-auto max-h-[200px] object-cover"
            autoPlay
            playsInline
            muted
          />
          {!isStreaming && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
              <div className="text-center">
                <div className="text-3xl mb-2">📹</div>
                <p className="text-sm">Click "Start" to begin</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900 text-white">
              <div className="text-center p-2">
                <div className="text-3xl mb-2">❌</div>
                <p className="text-sm mb-1">Webcam Error</p>
                <p className="text-xs opacity-80">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {!isStreaming ? (
            <button
              onClick={handleStartWebcam}
              disabled={!!error}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>📹</span>
              Start
            </button>
          ) : (
            <button
              onClick={stopWebcam}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>⏹️</span>
              Stop
            </button>
          )}

          {/* Status Indicators */}
          <div className="space-y-2">
            {isStreaming && (
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Analyzing...</span>
              </div>
            )}
          </div>

          {/* Test button for modal */}
          <button
            onClick={() => {
              console.log("Test confusion modal triggered");
              setTestModalOpen(true);
            }}
            className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors duration-200 text-sm"
          >
            Test Modal
          </button>
        </div>

        {/* Status Info */}
        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          {!hasWebcam && !error && (
            <p>Browser will ask for webcam permission</p>
          )}
          {hasWebcam && !isStreaming && (
            <p>Click "Start" to begin monitoring</p>
          )}
          {isStreaming && <p>Monitoring facial expressions</p>}
        </div>

        {/* Sentiment Analysis Results - Compact */}
        {sentimentResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Recent Analysis
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {sentimentResults
                .slice()
                .reverse()
                .slice(0, 3) // Show only last 3 results
                .map((result, index) => (
                  <div
                    key={result.timestamp}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.sentiment === "positive"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : result.sentiment === "negative"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {result.sentiment}
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Confusion Modal */}
      <ConfusionModal
        isOpen={showConfusionModal || testModalOpen}
        onClose={() => {
          dismissConfusionModal();
          setTestModalOpen(false);
        }}
      />
    </div>
  );
}
