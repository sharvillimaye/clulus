"use client";

import React from "react";
import MathVideoPlayer from "./MathVideoPlayer";

export default function VideoDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Math Video Generation Demo
      </h1>

      <div className="space-y-8">
        {/* Demo 1: Derivative */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Example 1: Derivative
          </h2>
          <MathVideoPlayer
            question="Find the derivative of x^2 + 3x"
            autoGenerate={false}
          />
        </div>

        {/* Demo 2: Integration */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Example 2: Integration
          </h2>
          <MathVideoPlayer
            question="Integrate x^2 + 2x + 1"
            autoGenerate={false}
          />
        </div>

        {/* Demo 3: Quadratic Equation */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Example 3: Quadratic Equation
          </h2>
          <MathVideoPlayer
            question="Solve x^2 - 5x + 6 = 0"
            autoGenerate={false}
          />
        </div>

        {/* Custom Question */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Custom Question
          </h2>
          <MathVideoPlayer
            question="Find the limit as x approaches 0 of sin(x)/x"
            autoGenerate={false}
          />
        </div>
      </div>
    </div>
  );
}
