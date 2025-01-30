import React, { FC } from "react";
import Loader from "../Loader"; // if you have a Loader component
import { PencilLine } from "lucide-react";

interface WelcomeModalProps {
  onSubscribe: () => void;
  isCreatingSession: boolean;
  onClose: () => void; // <-- new callback for closing
}

const WelcomeModal: FC<WelcomeModalProps> = ({
  onSubscribe,
  isCreatingSession,
  onClose,
}) => {
  return (
    // The outer overlay covers the whole screen.
    // Clicking this area closes the modal.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      onClick={onClose}
    >
      {/* The inner container for the modal content. 
          We stop propagation so clicks here don’t close the modal. */}
      <div
        className="relative bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-sm w-full flex flex-col md:flex-row gap-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button (X) in top-right corner */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          &times;
        </button>

        {/* LEFT COLUMN: Basic To-Do Info */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-4">
            Welcome to Your To-Do List App
            <PencilLine size={30} className="inline-block ml-2" />
          </h2>
          <p className="text-gray-300 mb-2">
            This app helps you organize your tasks quickly and efficiently. You
            can add, edit, or delete tasks to stay on top of your daily goals.
          </p>
          <p className="text-gray-300">
            Start by adding a few tasks and see how productive you can be!
          </p>
        </div>

        {/* RIGHT COLUMN: Premium AI Features */}
        <div className="md:w-1/3 flex flex-col justify-center items-center gap-4">
          <h3 className="text-xl font-semibold">Unlock AI Features</h3>
          <p className="text-gray-300 text-center">
            Upgrade to our pro plan for AI-powered list creation. It's only $1
            per month!
          </p>
          <button
            onClick={onSubscribe}
            disabled={isCreatingSession}
            className="px-4 py-2 w-40 bg-red-600 hover:bg-red-700 rounded-full text-white"
          >
            {isCreatingSession ? (
              <div className="flex items-center justify-center">
                <Loader color="white" />
              </div>
            ) : (
              "Subscribe Now"
            )}
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
