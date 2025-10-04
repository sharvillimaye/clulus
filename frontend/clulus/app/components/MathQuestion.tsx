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
    // plot problem
    // graph problem
    //
    {
      question:
        "What is the value of the definite integral $$\\int_{1}^{2} (3x^2 + 2x + 1) dx$$?",
      answer: 11,
      options: [9, 10, 11, 12],
      explanation:
        "To solve this problem, we first find the antiderivative of the function $f(x) = 3x^2 + 2x + 1$. We use the power rule for integration, which states that $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$.\n\nThe antiderivative of $3x^2$ is $\\frac{3x^{2+1}}{2+1} = \\frac{3x^3}{3} = x^3$.\n\nThe antiderivative of $2x$ is $\\frac{2x^{1+1}}{1+1} = \\frac{2x^2}{2} = x^2$.\n\nThe antiderivative of the constant $1$ is $x$.\n\nSo, the antiderivative of the entire function is $F(x) = x^3 + x^2 + x$. We can ignore the constant of integration, C, because it will cancel out during the evaluation of the definite integral.\n\nNext, we use the Fundamental Theorem of Calculus, which states that $\\int_{a}^{b} f(x) dx = F(b) - F(a)$.\n\nWe evaluate the antiderivative at the upper limit (2) and the lower limit (1):\n\nEvaluation at $x=2$: $F(2) = (2)^3 + (2)^2 + 2 = 8 + 4 + 2 = 14$.\n\nEvaluation at $x=1$: $F(1) = (1)^3 + (1)^2 + 1 = 1 + 1 + 1 = 3$.\n\nFinally, we subtract the lower limit value from the upper limit value:\n\n$F(2) - F(1) = 14 - 3 = 11$.\n\nTherefore, the value of the definite integral is 11.",
      difficulty: "easy",
    },
    {
      question:
        "A circle with center (3, 4) and a radius of 5 units is inscribed in a square. What is the area of the square?",
      answer: 100,
      options: [25, 50, 75, 100],
      explanation:
        "When a circle is inscribed in a square, the diameter of the circle is equal to the side length of the square. The problem gives the radius of the circle, which is 5 units. \n\nThe diameter of the circle is $2 * radius = 2 * 5 = 10$ units.\n\nSince the diameter of the circle is equal to the side length of the square, the side length of the square is 10 units.\n\nThe area of a square is calculated by the formula $Area = side^2$.\n$Area = 10^2 = 100$ square units.\n\nThe coordinates of the circle's center (3, 4) are irrelevant to the calculation of the area of the square, but they confirm that the circle is a real geometric object.",
      difficulty: "easy",
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
          Press{" "}
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
            Ctrl+H
          </kbd>{" "}
          or hover the 💡 icon in the top-right corner for 3 seconds to get an
          AI-powered hint.
        </p>
      </div>
    </div>
  );
}
