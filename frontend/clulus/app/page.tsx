"use client";

import { useRef, useState } from "react";
import WebcamFeed from "./components/WebcamFeed";
import MathQuestion from "./components/MathQuestion";
import HintSlideIn from "./components/HintSlideIn";

interface MathProblem {
  question: string;
  answer: number;
  options: number[];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export default function Home() {
  const [showHint, setShowHint] = useState(false);
  const [qContent, setQContent] = useState<MathProblem | null>(null);
  const [screenshot, setScreenshot] = useState<string>("");

  const handleShowHint = () => {
    // Capture screenshot of the math question area
    const mathElement = document.querySelector("[data-math-component]");
    if (mathElement) {
      // You can use html2canvas or similar library to capture screenshot
      // For now, we'll just set a placeholder
      setScreenshot(""); // Replace with actual screenshot capture
    }
    setShowHint(true);
  };

  const handleCloseHint = () => {
    setShowHint(false);
  };

  const handleAcceptHint = () => {};

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Main Content Area - Math Question */}
        <div className="flex-1 flex items-center justify-center p-8">
          <MathQuestion setQContent={setQContent} />
        </div>

        {/* Sidebar - Webcam Feed */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <WebcamFeed />
        </div>
      </div>

      {/* Hint Slide In Component */}
      <HintSlideIn
        isVisible={showHint}
        onClose={handleCloseHint}
        onAcceptHint={handleAcceptHint}
        question={qContent?.question || "What is 15 × 7?"}
        difficulty={qContent?.difficulty || "medium"}
        screenshot={screenshot}
      />
    </div>
  );
}
