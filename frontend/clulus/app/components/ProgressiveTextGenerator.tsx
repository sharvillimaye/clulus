"use client";

import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";

interface ProgressiveTextGeneratorProps {
  difficulty: "easy" | "medium" | "hard";
  onTextUpdate: (text: string) => void;
  onComplete: () => void;
  isGenerating: boolean;
  onError: (error: string) => void;
  screenshot?: string; // Base64 encoded screenshot
}

export default function ProgressiveTextGenerator({
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
      //console.log("All env vars:", process.env);
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error(
          "Google API key not found. Please set NEXT_PUBLIC_GOOGLE_API_KEY environment variable."
        );
      }
      const difficultyPrompts = {
        easy: "Give a simple, encouraging hint for this math problem. Focus on basic concepts and step-by-step guidance. Use simple language and encourage the student.",
        medium:
          "Provide a helpful hint that guides the student toward the solution without giving away the answer. Include key concepts and approaches. Challenge them to think deeper.",
        hard: "Give an advanced hint that challenges the student to think deeper about the problem. Include mathematical reasoning and multiple approaches. Encourage problem-solving skills.",
      };

      const prompt = `You are an expert math tutor. Analyze the attached screenshot of a math problem and generate exactly THREE tags in this specific format.

INSTRUCTIONS:
- Look at the screenshot carefully to understand the math problem
- Identify the question, answer options, and difficulty level
- Generate exactly 3 tags: <hint>, <audio_script>, and <question>
- Don't repeat tags or create multiple instances
- Keep responses concise and helpful

FORMAT (copy exactly):
<hint>Write a helpful 2-3 sentence hint that guides the student without giving away the answer</hint>
<audio_script>Write a brief 5-second audio script to explain the problem</audio_script>
<question>Write the exact mathematical question that the student is asking</question>

RESPONSE:`;

      // Initialize Google Generative AI
      const genAI = new GoogleGenAI({ apiKey: apiKey });

      // List available models first
      console.log("Listing available models...");
      const models = await genAI.models.list();
      console.log("Available models:", models);

      // Prepare content with image only
      const contentParts = [];

      console.log("Screenshot provided:", !!screenshot);
      console.log("Screenshot length:", screenshot?.length || 0);

      if (screenshot) {
        const base64Data = screenshot.replace(
          /^data:image\/[a-z]+;base64,/,
          ""
        );
        console.log("Base64 data length:", base64Data.length);

        contentParts.push({
          inlineData: {
            mimeType: "image/png",
            data: base64Data,
          },
        });
        contentParts.push({ text: prompt });
      } else {
        throw new Error("No screenshot provided for analysis");
      }

      const result = await genAI.models.generateContentStream({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: [{ parts: contentParts }],
      });

      let fullResponse = "";
      for await (const chunk of result) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullResponse += chunkText;
          setDisplayedText(fullResponse);
        }
      }

      console.log("EVERYTHING", fullResponse);
      // Extract only the hint content
      const hintMatch = fullResponse.match(/<hint>([\s\S]*?)<\/hint>/);
      const audioMatch = fullResponse.match(
        /<audio_script>([\s\S]*?)<\/audio_script>/
      );
      const questionMatch = fullResponse.match(
        /<question>([\s\S]*?)<\/question>/
      );
      console.log("💬💬💬", audioMatch);
      console.log("🤔🤔🤔", questionMatch);
      if (hintMatch) {
        const hintContent = hintMatch[1].trim();
        setDisplayedText(hintContent);
        onTextUpdate(hintContent);
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

  // Start generation when isGenerating becomes true
  useEffect(() => {
    if (isGenerating) {
      generateHint();
    }
  }, [isGenerating]);

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
