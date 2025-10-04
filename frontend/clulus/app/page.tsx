"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
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

  const handleShowHint = async () => {
    // Capture screenshot of the math question area
    const mathElement = document.querySelector("[data-math-component]");
    if (mathElement) {
      try {
        console.log("Starting screenshot capture...");
        const canvas = await html2canvas(mathElement as HTMLElement, {
          backgroundColor: "#ffffff",
          scale: 1,
          useCORS: true,
          allowTaint: true,
          logging: false,
          onclone: (clonedDoc) => {
            // Override all styles to use simple colors that html2canvas can parse
            const style = clonedDoc.createElement("style");
            style.textContent = `
              * {
                color: #000000 !important;
                background-color: #ffffff !important;
                border-color: #cccccc !important;
                box-shadow: none !important;
                text-shadow: none !important;
                filter: none !important;
              }
              .bg-gray-100, .bg-gray-50, .bg-white {
                background-color: #ffffff !important;
              }
              .text-gray-800, .text-gray-700, .text-gray-600, .text-gray-500 {
                color: #000000 !important;
              }
              .border-gray-200, .border-gray-300 {
                border-color: #cccccc !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          },
        });
        const screenshotDataUrl = canvas.toDataURL("image/png");
        setScreenshot(screenshotDataUrl);
        console.log(
          "Screenshot captured successfully:",
          screenshotDataUrl.substring(0, 50) + "..."
        );
        // Only show hint after screenshot is captured
        setShowHint(true);
      } catch (error) {
        console.error("Error capturing screenshot:", error);
        setScreenshot("");
        // Still show hint even if screenshot fails
        setShowHint(true);
      }
    } else {
      console.error("Math element not found for screenshot");
      setShowHint(true);
    }
  };

  const handleCloseHint = () => {
    setShowHint(false);
  };

  const handleAcceptHint = () => {};

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col h-screen">
        {/* Main Content Area - Math Question */}
        <div className="flex-1 flex items-center justify-center p-8">
          <MathQuestion setQContent={setQContent} />
        </div>

        {/* Hint Button */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={handleShowHint}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
          >
            <span>💡</span>
            Get Hint
          </button>
        </div>
      </div>

      {/* Hint Slide In Component */}
      <HintSlideIn
        isVisible={showHint}
        onClose={handleCloseHint}
        onAcceptHint={handleAcceptHint}
        difficulty={qContent?.difficulty || "medium"}
        screenshot={screenshot}
      />
    </div>
  );
}
