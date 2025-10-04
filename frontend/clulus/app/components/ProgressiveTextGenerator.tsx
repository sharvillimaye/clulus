"use client";

import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import MathVideoPlayer from "./MathVideoPlayer";

// const elevenlabs = new ElevenLabsClient();
// const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
//     text: 'The first move is what sets everything in motion.',
//     modelId: 'eleven_multilingual_v2',
//     outputFormat: 'mp3_44100_128',
// });
// await play(audio);

interface ProgressiveTextGeneratorProps {
  difficulty: "easy" | "medium" | "hard";
  onTextUpdate: (text: string) => void;
  onComplete: () => void;
  isGenerating: boolean;
  onError: (error: string) => void;
  screenshot?: string; // Base64 encoded screenshot
}

export default function ProgressiveTextGenerator({
  onTextUpdate,
  onComplete,
  isGenerating,
  onError,
  screenshot,
}: ProgressiveTextGeneratorProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [fullText, setFullText] = useState("");
  const [extractedQuestion, setExtractedQuestion] = useState<string>("");
  const [videoGenerated, setVideoGenerated] = useState(false);
  const [videoBlob, setVideoBlob] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoHoverTimer, setVideoHoverTimer] = useState(0);
  const [isVideoHovering, setIsVideoHovering] = useState(false);
  const [hasHoveredForVideo, setHasHoveredForVideo] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const videoHoverIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to generate video
  const generateVideo = async (mathQuestion: string) => {
    if (!mathQuestion.trim() || videoGenerated) return;

    try {
      const response = await fetch(
        "http://localhost:8080/generate_video_blob",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: mathQuestion }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setVideoGenerated(true);
        setVideoBlob(data.video_blob);
        console.log("Video generated successfully");
      } else {
        throw new Error("Video generation failed");
      }
    } catch (err) {
      console.error("Video generation error:", err);
    }
  };

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

      const prompt = `You are an expert math tutor. Analyze the attached screenshot of a math problem and generate exactly THREE tags in this specific format.

INSTRUCTIONS:
- Look at the screenshot carefully to understand the math problem
- Identify the question, answer options, and difficulty level
- Generate exactly 3 tags: <hint>, <audio_script>, and <question>
- Don't repeat tags or create multiple instances
- Keep responses concise and helpful
- Use LaTeX notation for mathematical expressions (e.g., $x^2$, $\\frac{a}{b}$, $\\int_0^1 f(x) dx$)

FORMAT (copy exactly):
<hint>Write a helpful 2 sentence hint that guides the student WITHOUT giving away the answer, focus on helping develop intuition and problem-solving skills. Use LaTeX for math expressions.</hint>
<question>Write the exact mathematical question, keeping all essential information to solve the problem, keep it as concise as possible. Use LaTeX notation for mathematical expressions.</question>
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

      if (hintMatch) {
        const hintContent = hintMatch[1].trim();
        setDisplayedText(hintContent);
        onTextUpdate(hintContent);
      }

      // Extract and store the question for video generation
      if (questionMatch) {
        const questionContent = questionMatch[1].trim();
        setExtractedQuestion(questionContent);
        console.log("📝 Extracted question:", questionContent);
        // Auto-generate video when question is extracted
        generateVideo(questionContent);
      }

      console.log("💬💬💬", audioMatch?.[0]);
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

  // Handle video button hover timer
  useEffect(() => {
    if (isVideoHovering && extractedQuestion) {
      videoHoverIntervalRef.current = setInterval(() => {
        setVideoHoverTimer((prev) => {
          const newTimer = prev + 100; // Increment by 100ms
          if (newTimer >= 3000) {
            // 3 seconds - mark as hovered
            setHasHoveredForVideo(true);
            return 3000;
          }
          return newTimer;
        });
      }, 100);
    } else {
      if (videoHoverIntervalRef.current) {
        clearInterval(videoHoverIntervalRef.current);
        videoHoverIntervalRef.current = null;
      }
      if (!isVideoHovering) {
        setVideoHoverTimer(0);
        if (!videoGenerated) {
          setShowVideo(false);
        }
      }
    }

    return () => {
      if (videoHoverIntervalRef.current) {
        clearInterval(videoHoverIntervalRef.current);
        videoHoverIntervalRef.current = null;
      }
    };
  }, [isVideoHovering, extractedQuestion, videoGenerated]);

  // Show video when generation completes after hover
  useEffect(() => {
    if (hasHoveredForVideo && videoGenerated && videoBlob) {
      setShowVideo(true);
    }
  }, [hasHoveredForVideo, videoGenerated, videoBlob]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoHoverIntervalRef.current) {
        clearInterval(videoHoverIntervalRef.current);
      }
    };
  }, []);

  // Video button hover handlers
  const handleVideoMouseEnter = () => {
    if (extractedQuestion) {
      setIsVideoHovering(true);
    }
  };

  const handleVideoMouseLeave = () => {
    setIsVideoHovering(false);
  };

  return (
    <div className="w-full space-y-4">
      {/* AI Generated Hint */}
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
              <h1>{displayedText}</h1>
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

      {/* Math Video Player - Only show when video is generated and user has hovered for 3 seconds */}
      {extractedQuestion && videoGenerated && showVideo && videoBlob && (
        <MathVideoPlayer
          question={extractedQuestion}
          className="mt-4"
          autoGenerate={false}
          showVideo={true}
          videoBlob={videoBlob}
        />
      )}

      {/* Video Hover Button - Show first */}
      {extractedQuestion && !hasHoveredForVideo && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              Hover the button for 3 seconds to generate math animation.
            </div>
            <button
              onMouseEnter={handleVideoMouseEnter}
              onMouseLeave={handleVideoMouseLeave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium relative group"
            >
              🎬 Generate Animation
              {isVideoHovering && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {Math.round(videoHoverTimer / 100) / 10}s / 3.0s
                </div>
              )}
            </button>
          </div>
          {isVideoHovering && (
            <div className="mt-3">
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${(videoHoverTimer / 3000) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Generation Status - Show after hover */}
      {extractedQuestion && hasHoveredForVideo && !videoGenerated && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Generating math animation...
            </span>
          </div>
        </div>
      )}

      {/* Video Ready Status - Show when video is generated but not displayed */}
      {extractedQuestion &&
        videoGenerated &&
        !showVideo &&
        hasHoveredForVideo && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-4">
            <div className="flex items-center gap-2">
              <div className="text-sm text-green-800 dark:text-green-200">
                Math animation ready! Hover the button again for 3 seconds to
                view.
              </div>
              <button
                onMouseEnter={handleVideoMouseEnter}
                onMouseLeave={handleVideoMouseLeave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium relative group"
              >
                🎬 View Animation
                {isVideoHovering && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {Math.round(videoHoverTimer / 100) / 10}s / 3.0s
                  </div>
                )}
              </button>
            </div>
            {isVideoHovering && (
              <div className="mt-3">
                <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                  <div
                    className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${(videoHoverTimer / 3000) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
