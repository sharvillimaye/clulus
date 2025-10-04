"use client";

import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";

interface ProgressiveTextGeneratorProps {
  question: string;
  difficulty: "easy" | "medium" | "hard";
  onTextUpdate: (text: string) => void;
  onComplete: () => void;
  isGenerating: boolean;
  onError: (error: string) => void;
  screenshot?: string; // Base64 encoded screenshot
}

export default function ProgressiveTextGenerator({
  question,
  difficulty,
  onTextUpdate,
  onComplete,
  isGenerating,
  onError,
  screenshot,
}: ProgressiveTextGeneratorProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [fullText, setFullText] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Function to generate hint using Google Gemini AI
  const generateHint = async () => {
    try {
      setIsTyping(true);
      setDisplayedText("");
      setFullText("");

      // Get API key from environment variables
      console.log("All env vars:", process.env);
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error(
          "Google API key not found. Please set NEXT_PUBLIC_GOOGLE_API_KEY environment variable."
        );
      }
      const prompt = `
        Give a simple, encouraging hint for this math problem. Focus on basic concepts and step-by-step guidance.
        
        Math Problem: ${question}
        
        Please provide a helpful hint that:
        1. Doesn't give away the answer directly
        2. Guides the student toward the solution
        3. Explains the key concepts involved
        4. Is appropriate for ${difficulty} difficulty level
        5. Is encouraging and supportive
        
        Keep the response concise but informative (2-3 sentences maximum).
      `;

      // Initialize Google Generative AI
      const genAI = new GoogleGenAI({ apiKey: apiKey });

      // List available models first
      console.log("Listing available models...");
      const models = await genAI.models.list();
      console.log("Available models:", models);

      // Prepare content with text and optionally image
      const contentParts = [{ text: prompt }];

      if (screenshot) {
        contentParts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: screenshot.replace(/^data:image\/[a-z]+;base64,/, ""),
          },
        });
      }

      const result = await genAI.models.generateContentStream({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: [{ parts: contentParts }],
      });

      for await (const chunk of result) {
        const chunkText = chunk.text;
        if (chunkText) {
          setDisplayedText((prev) => prev + chunkText);
        }
      }
      onComplete();
    } catch (error: any) {
      console.error("Error generating hint:", error);
      onError(error.message || "Failed to generate hint");
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  // Start generation when component mounts or when isGenerating becomes true
  useEffect(() => {
    generateHint();
  }, []);

  return (
    <div className="w-full">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
          💡 AI Generated Hint:
        </h4>
        <div className="text-xs text-blue-800 dark:text-blue-200 min-h-[60px]">
          {isTyping ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Generating hint...</span>
            </div>
          ) : displayedText ? (
            <div className="whitespace-pre-wrap">
              {displayedText}
              {isGenerating && displayedText.length < fullText.length && (
                <span className="animate-pulse">|</span>
              )}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              Click "Get Hint" to generate an AI-powered hint for this problem.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
