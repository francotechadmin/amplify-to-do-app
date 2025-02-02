"use client";
import React, { useState } from "react";
import SubscriptionGuard from "../SubscriptionGuard";
import { Check, FilePenLine, Repeat, Send, Trash } from "lucide-react";
import { generateAiTodos } from "@/graphql/mutations";
import { generateClient } from "aws-amplify/api";
import { useMutation } from "@tanstack/react-query";
import Loader from "../Loader";

interface AITask {
  id: string;
  content: string;
}

interface AiFeatureModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tasks: AITask[]) => void;
  initialTasks?: AITask[]; // optional initial AI tasks if you have them
}

// 1) GraphQL call to generate tasks
const client = generateClient({ authMode: "userPool" });
const generateAiTasks = async (prompt: string) => {
  const response = await client.graphql({
    query: generateAiTodos,
    variables: { input: { userId: "none", prompt } },
  });
  // This line expects the API returns an array of strings in "tasks"
  // e.g. type GenerateAiTodosPayload { tasks: [String] }
  return response.data.generateAiTodos.tasks;
};

const AiFeatureModal: React.FC<AiFeatureModalProps> = ({
  open,
  onClose,
  onSave,
  initialTasks = [],
}) => {
  const [userPrompt, setUserPrompt] = useState("");
  const [tasks, setTasks] = useState<AITask[]>(initialTasks);

  // 2) Mutation for generating AI tasks
  const {
    mutate: handleGenerateAiTasks,
    isPending: isGenerating,
    error: generateError,
  } = useMutation({
    mutationFn: generateAiTasks,
    onSuccess: (generatedTasks) => {
      if (!generatedTasks) return;

      // Convert strings into our local AITask shape
      setTasks(
        generatedTasks.map((content: string | null, i: number) => ({
          id: i.toString(),
          content: content || "",
        }))
      );
    },
    onError: (err) => {
      console.error("Error generating AI tasks:", err);
    },
  });

  // Called when user clicks "Save List"
  const handleSave = () => {
    onSave(tasks);
    // Clear tasks on save
    setTasks([]);
    setUserPrompt("");
    onClose();
  };

  // Helper to edit an item
  const handleEdit = (id: string) => {
    const itemToEdit = tasks.find((t) => t.id === id);
    if (!itemToEdit) return;

    const newContent = prompt("Edit the item", itemToEdit.content);
    if (newContent !== null) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, content: newContent } : t))
      );
    }
  };

  // Helper to delete an item
  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // If modal is closed, do not render
  if (!open) return null;

  // 3) "Regenerate" calls the same mutation with the same prompt
  const handleRegenerate = () => {
    if (!userPrompt) return; // skip if empty
    handleGenerateAiTasks(userPrompt);
  };

  // 4) Rendering the modal UI
  return (
    <SubscriptionGuard onClose={onClose}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 text-lg"
        onClick={onClose}
      >
        <div
          className="relative max-w-md w-full bg-gray-900 p-6 rounded shadow-md text-white text-lg flex flex-col items-center mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title */}
          <h2 className="mb-4 text-lg font-semibold">
            Generate List using AI ✨
          </h2>

          {/* Prompt input */}
          <form
            className="flex items-center mb-4 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateAiTasks(userPrompt);
            }}
          >
            <input
              type="text"
              placeholder="Create a list of tasks for ..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="flex-1 border border-gray-300 text-black rounded-full px-3 py-2 text-[16px] focus:outline-none hover:border-gray-500"
              disabled={isGenerating}
            />
            <button
              type="submit"
              className="bg-red-600 text-white py-2 px-4 rounded-full text-sm ml-2 hover:bg-red-700 disabled:opacity-60"
              disabled={isGenerating || !userPrompt.trim()}
            >
              {isGenerating ? (
                <Loader color="white" />
              ) : (
                <Send size={16} className="inline" />
              )}
            </button>
          </form>

          {/* Error message (if any) */}
          {generateError && (
            <p className="text-red-400 text-sm mb-2">
              {(generateError as Error)?.message || "Error generating tasks."}
            </p>
          )}

          {/* AI-generated list */}
          <ul className="h-64 overflow-y-auto space-y-2 mb-4 w-full flex flex-col custom-scrollbar">
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-sm w-full h-full flex items-center justify-center">
                Your AI-generated list will appear here!
              </p>
            ) : (
              tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between rounded p-2 gap-2"
                >
                  <button
                    className="text-white hover:underline text-xs flex-0"
                    onClick={() => handleEdit(task.id)}
                    disabled={isGenerating}
                  >
                    <FilePenLine size={16} />
                  </button>
                  <span className="text-sm flex-1">{task.content}</span>
                  <button
                    className="text-red-500 hover:underline text-xs flex-0"
                    onClick={() => handleDelete(task.id)}
                    disabled={isGenerating}
                  >
                    <Trash size={16} />
                  </button>
                </li>
              ))
            )}
          </ul>

          {/* Footer Buttons - Hide if no tasks */}

          {/* Regenerate Button */}
          <button
            onClick={handleRegenerate}
            className="bg-white text-red-600 w-44 py-2 rounded-full text-sm hover:opacity-75 mb-4 disabled:opacity-60"
            disabled={isGenerating || !userPrompt.trim()}
            hidden={tasks.length === 0}
          >
            {isGenerating ? "Regenerating..." : "Regenerate"}
            <Repeat size={16} className="inline ml-2" />
          </button>

          <div className="flex justify-end gap-2">
            {/* Save */}
            <button
              onClick={handleSave}
              className="bg-red-600 text-white w-44 py-2 rounded-full text-sm hover:bg-red-700 disabled:opacity-60"
              disabled={isGenerating}
              hidden={tasks.length === 0}
            >
              Save List
              <Check size={16} className="inline ml-2" />
            </button>
          </div>

          {/* Close "X" (optional) */}
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={onClose}
            disabled={isGenerating}
          >
            &times;
          </button>
        </div>
      </div>
    </SubscriptionGuard>
  );
};

export default AiFeatureModal;
