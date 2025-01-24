import React, { FC } from "react";
import Loader from "../Loader"; // if you have a Loader component

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
        className="relative bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-3xl w-full flex flex-col md:flex-row gap-8"
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
          <h2 className="text-2xl font-bold mb-4">
            Welcome to Simple To-Do App
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
            Upgrade to our premium plan for AI-powered suggestions and advanced
            insights to help you work smarter, not harder.
          </p>
          <button
            onClick={onSubscribe}
            disabled={isCreatingSession}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            {isCreatingSession ? <Loader /> : "Subscribe Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
