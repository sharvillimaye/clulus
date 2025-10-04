"use client";

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  children: string;
  display?: boolean;
}

export default function MathText({ children, display = false }: MathTextProps) {
  // Split text by math delimiters
  const parts = children.split(/(\$\$?[^$]*\$\$?)/g);
  
  return (
    <span>
      {parts.map((part, index) => {
        // Check if this part is a math equation
        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Block math (display mode)
          const mathContent = part.slice(2, -2);
          return <BlockMath key={index} math={mathContent} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          // Inline math
          const mathContent = part.slice(1, -1);
          return <InlineMath key={index} math={mathContent} />;
        } else {
          // Regular text
          return <span key={index}>{part}</span>;
        }
      })}
    </span>
  );
}
