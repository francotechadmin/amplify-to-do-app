// AiFeatureModal.tsx
"use client";
import React, { useState, FormEvent } from "react";
import { generateAiTodos } from "@/graphql/mutations";
import { generateClient } from "aws-amplify/api";
import { useMutation } from "@tanstack/react-query";

import { Check, FilePenLine, Repeat, Send, Trash } from "lucide-react";
import Loader from "../Loader";
import SubscriptionModal from "../SubscriptionModal";

import { useUserData } from "../../hooks/useUser";
import { useSubscription } from "../../hooks/useSubscriptionStatus";

interface AITask {
  id: string;
  content: string;
}

interface AiFeatureModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tasks: AITask[]) => void;
  initialTasks?: AITask[];
}

const client = generateClient({ authMode: "userPool" });
const MAX_FREE_QUERIES = 10;

/**
 * Server call to generate tasks (increments freeQueriesUsed if unsubscribed).
 */
async function generateAiTasks(prompt: string) {
  const response = await client.graphql({
    query: generateAiTodos,
    variables: { input: { userId: "none", prompt } },
  });
  return response.data.generateAiTodos.tasks;
}

/** Sub-component for the Prompt Input + "Generate" button */
function PromptForm({
  userPrompt,
  setUserPrompt,
  isGenerating,
  onGenerateClick,
}: {
  userPrompt: string;
  setUserPrompt: React.Dispatch<React.SetStateAction<string>>;
  isGenerating: boolean;
  onGenerateClick: () => void;
}) {
  /** Handle form submit (pressing Enter) */
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onGenerateClick();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center mb-4 w-full">
      <input
        type="text"
        placeholder="Create a list of tasks for ..."
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        className="flex-1 border border-gray-300 text-black rounded-full h-10 px-3 text-[16px]"
        disabled={isGenerating}
      />
      <button
        type="submit"
        disabled={isGenerating || !userPrompt.trim()}
        className="bg-red-600 text-white h-10 px-4 rounded-full text-sm ml-2 hover:bg-red-700 disabled:opacity-60"
      >
        {isGenerating ? <Loader color="white" /> : <Send size={16} />}
      </button>
    </form>
  );
}

/** Sub-component to list tasks with Edit & Delete controls */
function TasksList({
  tasks,
  isGenerating,
  onEdit,
  onDelete,
}: {
  tasks: AITask[];
  isGenerating: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <p className="text-gray-500 text-sm w-full h-full flex items-center justify-center">
        Your AI-generated list will appear here!
      </p>
    );
  }

  return (
    <ul className="h-64 overflow-y-auto space-y-2 mb-4 w-full flex flex-col custom-scrollbar">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-center justify-between rounded p-2 gap-2"
        >
          <button
            onClick={() => onEdit(task.id)}
            disabled={isGenerating}
            className="text-white hover:underline text-xs flex-0"
          >
            <FilePenLine size={16} />
          </button>
          <span className="text-sm flex-1">{task.content}</span>
          <button
            onClick={() => onDelete(task.id)}
            disabled={isGenerating}
            className="text-red-500 hover:underline text-xs flex-0"
          >
            <Trash size={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Sub-component for the “Regenerate” and “Save List” buttons */
function FooterButtons({
  hasTasks,
  isGenerating,
  userPrompt,
  onGenerateClick,
  onSave,
}: {
  hasTasks: boolean;
  isGenerating: boolean;
  userPrompt: string;
  onGenerateClick: () => void;
  onSave: () => void;
}) {
  if (!hasTasks) return null; // No tasks => hide the footer buttons

  return (
    <div className="flex flex-col items-center w-full space-y-3">
      {/* Regenerate Button */}
      <button
        onClick={onGenerateClick}
        disabled={isGenerating || !userPrompt.trim()}
        className="bg-white text-red-600 w-44 py-2 rounded-full text-sm hover:opacity-75 disabled:opacity-60"
      >
        {isGenerating ? "Regenerating..." : "Regenerate"}
        <Repeat size={16} className="inline ml-2" />
      </button>

      {/* Save List Button */}
      <button
        onClick={onSave}
        disabled={isGenerating}
        className="bg-red-600 text-white w-44 py-2 rounded-full text-sm hover:bg-red-700 disabled:opacity-60"
      >
        Save List
        <Check size={16} className="inline ml-2" />
      </button>
    </div>
  );
}

/**
 * Main AI Feature Modal.
 */
export default function AiFeatureModal({
  open,
  onClose,
  onSave,
  initialTasks = [],
}: AiFeatureModalProps) {
  const [userPrompt, setUserPrompt] = useState("");
  const [tasks, setTasks] = useState<AITask[]>(initialTasks);
  const [showSubModal, setShowSubModal] = useState(false);

  // Fetch user data
  const { data: userData, refetch: refetchUserData } = useUserData();
  const subscriptionStatus = userData?.subscriptionStatus || "inactive";
  const freeQueriesUsed = userData?.freeQueriesUsed ?? 0;
  const freeQueriesLeft = MAX_FREE_QUERIES - freeQueriesUsed;
  const isSubscribed = subscriptionStatus === "active";

  // Subscription logic (Stripe, etc.)
  const { handleSubscribe, isCreatingSession } = useSubscription();

  // Mutation to generate tasks from AI
  const {
    mutate: handleGenerateAiTasks,
    isPending: isGenerating,
    error: generateError,
  } = useMutation({
    mutationFn: generateAiTasks,
    onSuccess: (generatedTasks) => {
      if (!generatedTasks) return;
      setTasks(
        generatedTasks.map((content: string | null, i: number) => ({
          id: i.toString(),
          content: content ?? "",
        }))
      );
      // Re-fetch user data to update freeQueriesUsed
      refetchUserData();
    },
  });

  /** Called on "Generate" or "Regenerate" click. */
  function onGenerateClick() {
    if (isSubscribed) {
      // Subscribed => unlimited usage
      handleGenerateAiTasks(userPrompt);
      return;
    }
    // Not subscribed => check free queries
    if (freeQueriesLeft > 0) {
      handleGenerateAiTasks(userPrompt);
    } else {
      setShowSubModal(true);
    }
  }

  /** Save tasks, reset state, close modal */
  function handleSave() {
    onSave(tasks);
    setTasks([]);
    setUserPrompt("");
    onClose();
  }

  /** Edit a task’s content */
  function handleEdit(id: string) {
    const itemToEdit = tasks.find((t) => t.id === id);
    if (!itemToEdit) return;
    const newContent = prompt("Edit item", itemToEdit.content);
    if (newContent !== null) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, content: newContent } : t))
      );
    }
  }

  /** Delete a task */
  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  // If modal is closed, render nothing
  if (!open) return null;

  return (
    <>
      {/* AI Modal Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 text-lg"
        onClick={onClose}
      >
        {/* AI Modal Content */}
        <div
          className="relative max-w-md w-full bg-gray-900 p-6 rounded shadow-md text-white text-lg flex flex-col items-center mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="mb-4 text-lg font-semibold">
            Generate Tasks with AI ✨
          </h2>

          {/* Show free queries left if user is not subscribed */}
          {!isSubscribed && (
            <p className="text-sm text-gray-300 mb-2">
              Free queries left: {freeQueriesLeft}/{MAX_FREE_QUERIES}
            </p>
          )}

          {/* Prompt Input Form */}
          <PromptForm
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            isGenerating={isGenerating}
            onGenerateClick={onGenerateClick}
          />

          {/* Error Message */}
          {generateError && (
            <p className="text-red-400 text-sm mb-2">
              {(generateError as Error).message || "Error generating tasks"}
            </p>
          )}

          {/* Tasks List */}
          <TasksList
            tasks={tasks}
            isGenerating={isGenerating}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Footer Buttons */}
          <FooterButtons
            hasTasks={tasks.length > 0}
            isGenerating={isGenerating}
            userPrompt={userPrompt}
            onGenerateClick={onGenerateClick}
            onSave={handleSave}
          />

          {/* Close "X" */}
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={onClose}
            disabled={isGenerating}
          >
            &times;
          </button>
        </div>
      </div>

      {/* Subscription Modal - only show if unsubscribed & out of free queries */}
      {showSubModal && (
        <SubscriptionModal
          open={true}
          onClose={() => setShowSubModal(false)}
          onSubscribe={handleSubscribe}
          isCreatingSession={isCreatingSession}
        />
      )}
    </>
  );
}
