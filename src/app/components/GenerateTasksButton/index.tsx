// components/GenerateTasksButton.tsx
"use client";
import React from "react";
import { Sparkles } from "lucide-react";

interface GenerateTasksButtonProps {
  onClick: () => void;
}

const GenerateTasksButton: React.FC<GenerateTasksButtonProps> = ({
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-red-600 text-white py-1 rounded-full hover:bg-red-400 flex items-center justify-center gap-2 relative px-4 mb-4"
    >
      <span>Generate Tasks</span>
      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
        PRO
      </span>
      <Sparkles size={14} />
    </button>
  );
};

export default GenerateTasksButton;
