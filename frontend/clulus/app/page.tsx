"use client";

import { useRef, useState, useEffect } from "react";
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
  const [hoverProgress, setHoverProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

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
    // Reset hover state when hint is closed
    setIsHovering(false);
    setHoverProgress(0);
  };

  const handleAcceptHint = () => {};

  // Add keyboard shortcut to trigger hints (Ctrl+H or Cmd+H)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "h" && !showHint) {
        event.preventDefault();
        handleShowHint();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showHint]);

  // Hover animation logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isHovering) {
      interval = setInterval(() => {
        setHoverProgress((prev) => {
          const newProgress = prev + 100 / 20; // 3 seconds = 30 * 100ms intervals
          if (newProgress >= 100) {
            handleShowHint();
            setIsHovering(false);
            return 0;
          }
          return newProgress;
        });
      }, 50);
    } else {
      setHoverProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovering]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col h-screen">
        {/* Main Content Area - Math Question */}
        <div className="flex-1 flex items-center justify-center p-8">
          <MathQuestion setQContent={setQContent} />
        </div>

        {/* Animated Hint Trigger - Top Right Corner */}
        <div className="fixed top-4 right-4 z-40">
          <div
            className={`relative w-16 h-16 group ${
              showHint ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
            onMouseEnter={showHint ? undefined : handleMouseEnter}
            onMouseLeave={showHint ? undefined : handleMouseLeave}
          >
            {/* Background Circle */}
            <div
              className={`absolute inset-0 bg-blue-500/20 rounded-full transition-all duration-300 ${
                showHint
                  ? ""
                  : "group-hover:bg-blue-500/30 group-hover:scale-110"
              }`}
            ></div>

            {/* Progress Ring */}
            <div className="absolute inset-0 rounded-full">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 64 64"
              >
                {/* Background circle */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-blue-500/30"
                />
                {/* Progress circle */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 28 * (1 - hoverProgress / 100)
                  }`}
                  className="text-blue-500 transition-all duration-100 ease-out"
                  style={{
                    strokeLinecap: "round",
                    opacity: isHovering ? 1 : 0,
                  }}
                />
              </svg>
            </div>

            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`transition-all duration-300 ${
                  showHint
                    ? "scale-100"
                    : isHovering
                    ? "scale-110"
                    : "scale-100"
                }`}
              >
                  <div className="text-blue-600 dark:text-blue-400 text-xl group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    💡
                  </div>
              </div>
            </div>

            {/* Tooltip */}
            <div
              className={`absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 transition-opacity duration-300 whitespace-nowrap ${
                showHint || hoverProgress > 0
                  ? "hidden"
                  : "group-hover:opacity-100"
              }`}
            >
              Hover for 3s to get hint
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
            </div>
          </div>
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
