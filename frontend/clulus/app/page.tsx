"use client";

import { useRef, useState } from "react";
import WebcamFeed from "./components/WebcamFeed";
import MathQuestion from "./components/MathQuestion";
import HintSlideIn from "./components/HintSlideIn";

export default function Home() {
  const [showHint, setShowHint] = useState(false);

  const handleShowHint = () => {
    setShowHint(true);
  };

  const handleCloseHint = () => {
    setShowHint(false);
  };

  const handleAcceptHint = () => {
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Main Content Area - Math Question */}
        <div className="flex-1 flex items-center justify-center p-8">
          <MathQuestion />
        </div>

        {/* Sidebar - Webcam Feed */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <WebcamFeed onShowHint={handleShowHint} />
        </div>
      </div>

      {/* Hint Slide In Component */}
      <HintSlideIn
        isVisible={showHint}
        onClose={handleCloseHint}
        onAcceptHint={handleAcceptHint}
      />
    </div>
  );
}
