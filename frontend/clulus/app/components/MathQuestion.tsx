"use client";

import React, { useState, useEffect } from "react";

interface MathProblem {
  question: string;
  answer: number;
  options: number[];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export default function MathQuestion({
  setQContent,
}: {
  setQContent: (content: MathProblem) => void;
}) {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(
    null
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Sample math problems
  const mathProblems: MathProblem[] = [
    {
      question: "What is 15 × 7?",
      answer: 105,
      options: [95, 105, 115, 125],
      explanation:
        "15 × 7 = 105. You can calculate this by multiplying 15 by 7.",
      difficulty: "easy",
    },
    {
      question: "Solve for x: 2x + 8 = 20",
      answer: 6,
      options: [4, 6, 8, 10],
      explanation: "2x + 8 = 20 → 2x = 20 - 8 → 2x = 12 → x = 6",
      difficulty: "medium",
    },
    {
      question: "What is the area of a circle with radius 5? (Use π ≈ 3.14)",
      answer: 78.5,
      options: [25, 31.4, 78.5, 157],
      explanation: "Area = π × r² = 3.14 × 5² = 3.14 × 25 = 78.5",
      difficulty: "medium",
    },
    {
      question: "What is 3/4 + 1/2?",
      answer: 1.25,
      options: [1, 1.25, 1.5, 2],
      explanation: "3/4 + 1/2 = 3/4 + 2/4 = 5/4 = 1.25",
      difficulty: "easy",
    },
    {
      question: "Find the derivative of x³ + 2x² - 5x + 1",
      answer: 3,
      options: [3, 6, 9, 12],
      explanation:
        "d/dx(x³ + 2x² - 5x + 1) = 3x² + 4x - 5. At x = 1: 3(1)² + 4(1) - 5 = 3 + 4 - 5 = 2",
      difficulty: "hard",
    },
    {
      question: "What is log₂(8)?",
      answer: 3,
      options: [2, 3, 4, 8],
      explanation: "log₂(8) = 3 because 2³ = 8",
      difficulty: "medium",
    },
    {
      question: "Solve: √(16 + 9)",
      answer: 5,
      options: [5, 7, 25, 49],
      explanation: "√(16 + 9) = √25 = 5",
      difficulty: "easy",
    },
    {
      question:
        "What is the slope of the line passing through (2, 3) and (4, 7)?",
      answer: 2,
      options: [1, 2, 3, 4],
      explanation: "Slope = (7-3)/(4-2) = 4/2 = 2",
      difficulty: "medium",
    },
  ];

  const generateNewProblem = () => {
    const randomIndex = Math.floor(Math.random() * mathProblems.length);
    const problem = mathProblems[randomIndex];
    setQContent(problem);
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
    setIsTimerActive(true);
  };

  const handleAnswerSelect = (answer: number) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);
    setIsTimerActive(false);

    if (currentProblem && selectedAnswer === currentProblem.answer) {
      setScore((prev) => prev + 1);
    }

    setTotalQuestions((prev) => prev + 1);
  };

  const handleNext = () => {
    generateNewProblem();
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showResult) {
      // Time's up - auto submit
      handleSubmit();
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, showResult]);

  // Generate first problem on mount
  useEffect(() => {
    generateNewProblem();
  }, []);

  // Console log HTML content when component mounts or updates
  useEffect(() => {
    // Log the innerHTML of the math question component (without class names)
    setTimeout(() => {
      const mathComponent = document.querySelector("[data-math-component]");
      if (mathComponent) {
        // Create a clone to avoid modifying the original DOM
        const clone = mathComponent.cloneNode(true) as HTMLElement;

        // Remove all class attributes
        const removeClasses = (element: HTMLElement) => {
          element.removeAttribute("class");
          Array.from(element.children).forEach((child) => {
            if (child instanceof HTMLElement) {
              removeClasses(child);
            }
          });
        };

        removeClasses(clone);
        console.log(clone.innerHTML);

        // Also log the original with classes for comparison
        //console.log("Math Question Component innerHTML (with classes):");
        //console.log(mathComponent.innerHTML);
      } else {
        console.log("Math Question Component not found in DOM");
      }
    }, 100); // Small delay to ensure DOM is updated
  }, [currentProblem]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900";
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900";
      case "hard":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto" data-math-component>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Math Challenge
        </h1>
        <div className="flex justify-center gap-6 text-lg">
          <div className="text-gray-600 dark:text-gray-400">
            Score:{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {score}
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Questions:{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        <div
          className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
            timeLeft > 10
              ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900"
              : timeLeft > 5
              ? "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900"
              : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900"
          }`}
        >
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* Question Card */}
      {currentProblem && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
          {/* Difficulty Badge */}
          <div className="flex justify-between items-start mb-6">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                currentProblem.difficulty
              )}`}
            >
              {currentProblem.difficulty.toUpperCase()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Question {totalQuestions + 1}
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              {currentProblem.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {currentProblem.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentProblem.answer;
              const isWrong = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 font-semibold text-lg ${
                    showResult
                      ? isCorrect
                        ? "bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-400 dark:text-green-200"
                        : isWrong
                        ? "bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-400 dark:text-red-200"
                        : "bg-gray-50 border-gray-300 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                      : isSelected
                      ? "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-200"
                      : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          {!showResult && (
            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-semibold"
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* Result and Explanation */}
          {showResult && (
            <div className="space-y-4">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold mb-2 ${
                    selectedAnswer === currentProblem.answer
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {selectedAnswer === currentProblem.answer
                    ? "✅ Correct!"
                    : "❌ Incorrect"}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  The correct answer is:{" "}
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {currentProblem.answer}
                  </span>
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  💡 Explanation:
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {currentProblem.explanation}
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold"
                >
                  Next Question
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Select an answer and click Submit, or wait for the timer to run out.
        </p>
        <p>
          Your webcam is monitoring your facial expressions for confusion
          detection.
        </p>
      </div>
    </div>
  );
}
