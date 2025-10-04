"use client";

import React, { useState, useEffect } from "react";

interface HintSlideInProps {
  isVisible: boolean;
  onClose: () => void;
  onAcceptHint: () => void;
}

export default function HintSlideIn({
  isVisible,
  onClose,
  onAcceptHint,
}: HintSlideInProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const handleAcceptHint = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onAcceptHint();
      onClose();
    }, 300);
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
            Our AI detected signs of confusion. Would you like a helpful hint
            for this math problem?
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
              💡 Hint Preview:
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Try breaking down the problem into smaller steps. Look for
              patterns or formulas you've learned before.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
          >
            No Thanks
          </button>
          <button
            onClick={handleAcceptHint}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            Get Hint
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
