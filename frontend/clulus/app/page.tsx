"use client";

import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import MathQuestion from "./components/MathQuestion";
import HintSlideIn from "./components/HintSlideIn";

interface MathProblem {
  question: string;
  answer: number | string;
  options: number[] | string[];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export default function Home() {
  const [showHint, setShowHint] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [qContent, setQContent] = useState<MathProblem | null>(null);
  const [screenshot, setScreenshot] = useState<string>("");
  const [hoverProgress, setHoverProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [questionMode, setQuestionMode] = useState<"predefined" | "custom">(
    "predefined"
  );
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [customQuestionSubmitted, setCustomQuestionSubmitted] = useState(false);

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
  // Clear the timeUp highlight when the hint opens
  setTimeUp(false);
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
    // Clear any timeUp highlight when closing
    setTimeUp(false);
  };

  const handleAcceptHint = () => {};

  // Handle custom question submission
  const handleCustomQuestionSubmit = () => {
    if (customQuestion.trim()) {
      // Create a custom MathProblem object
      const customProblem: MathProblem = {
        question: customQuestion.trim(),
        answer: "Custom Question", // Placeholder since we don't know the answer
        options: ["This is a custom question for demonstration"],
        explanation:
          "This is a custom question you entered. The AI will analyze it and provide hints based on the mathematical content.",
        difficulty: "medium", // Default difficulty for custom questions
      };

      setQContent(customProblem);
      setCustomQuestionSubmitted(true);
    }
  };

  // Reset custom question mode
  const handleResetCustomQuestion = () => {
    setCustomQuestion("");
    setCustomQuestionSubmitted(false);
    setQContent(null);
  };

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
        {/* Question Mode Toggle */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Question Mode
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setQuestionMode("predefined");
                      handleResetCustomQuestion();
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      questionMode === "predefined"
                        ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Predefined Questions
                  </button>
                  <button
                    onClick={() => {
                      setQuestionMode("custom");
                      handleResetCustomQuestion();
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      questionMode === "custom"
                        ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Custom Question
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Question Input */}
            {questionMode === "custom" && (
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="customQuestion"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Enter your math question:
                  </label>
                  <textarea
                    id="customQuestion"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="e.g., What is the derivative of x² + 3x + 2?"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    rows={3}
                    disabled={customQuestionSubmitted}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCustomQuestionSubmit}
                    disabled={!customQuestion.trim() || customQuestionSubmitted}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {customQuestionSubmitted
                      ? "Question Submitted"
                      : "Submit Question"}
                  </button>
                  {customQuestionSubmitted && (
                    <button
                      onClick={handleResetCustomQuestion}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area - Math Question */}
        <div className="flex-1 flex items-center justify-center p-8">
          {questionMode === "predefined" ? (
            <MathQuestion
              setQContent={(content) => setQContent(content)}
              onTimeUp={(up) => setTimeUp(up)}
            />
          ) : customQuestionSubmitted && qContent ? (
            <div className="w-full max-w-2xl mx-auto" data-math-component>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                  <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                    Custom Math Question
                  </h1>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900">
                    CUSTOM QUESTION
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                    {qContent.question}
                  </h2>
                </div>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  <p>
                    This is your custom question. Use the hint button (💡) in
                    the top-right corner or press{" "}
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                      Ctrl+H
                    </kbd>{" "}
                    to get an AI-powered hint and analysis.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">
                Enter a custom math question above to get started!
              </p>
            </div>
          )}
        </div>

        {/* Animated Hint Trigger - Top Right Corner */}
        <div className="fixed top-4 right-4 z-40">
          <div
            className={`relative w-16 h-16 group ${
              showHint ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            } ${
              timeUp && !showHint
                ? "animate-pulse-shadow"
                : ""
            }`}
            onMouseEnter={showHint ? undefined : handleMouseEnter}
            onMouseLeave={showHint ? undefined : handleMouseLeave}
          >
            {/* Background Circle */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-300 ${
                timeUp && !showHint
                  ? "bg-yellow-400/30 ring-4 ring-yellow-300/50 scale-105"
                  : showHint
                  ? "bg-blue-500/20"
                  : "bg-blue-500/20 group-hover:bg-blue-500/30 group-hover:scale-110"
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
        screenshot={questionMode === "predefined" ? screenshot : ""}
        customQuestion={questionMode === "custom" ? qContent?.question : ""}
      />
    </div>
  );
}
