"use client";

import React, { useState, useEffect } from "react";
import ProgressiveTextGenerator from "./ProgressiveTextGenerator";

interface HintSlideInProps {
  isVisible: boolean;
  onClose: () => void;
  onAcceptHint: () => void;
  difficulty?: "easy" | "medium" | "hard";
  screenshot?: string;
}

export default function HintSlideIn({
  isVisible,
  onClose,
  onAcceptHint,
  difficulty = "medium",
  screenshot,
}: HintSlideInProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Automatically start generating hint when modal appears
      setIsGenerating(true);
      setError("");
      setGeneratedText("");
    }
  }, [isVisible]);

  const handleAcceptHint = () => {
    if (!isGenerating) {
      console.log("Hint accepted, screenshot available:", !!screenshot);
      console.log("Screenshot length:", screenshot?.length || 0);
      setIsGenerating(true);
      setError("");
      setGeneratedText("");
    }
  };

  const handleTextUpdate = (text: string) => {
    setGeneratedText(text);
  };

  const handleGenerationComplete = () => {
    setIsGenerating(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsGenerating(false);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setIsGenerating(false);
    setGeneratedText("");
    setError("");
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  if (!isVisible && !isAnimating) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${
        isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Need a Hint?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We noticed you might be struggling
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
            Generating an AI-powered hint for this math problem...
          </p>

          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2 text-sm">
                ⚠️ Error:
              </h4>
              <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
            </div>
          ) : (
            <ProgressiveTextGenerator
              difficulty={difficulty}
              onTextUpdate={handleTextUpdate}
              onComplete={handleGenerationComplete}
              isGenerating={isGenerating}
              onError={handleError}
              screenshot={screenshot}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
          >
            Close
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
        >
          <svg
            className="w-4 h-4"
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
    </div>
  );
}
