import React, { FC } from "react";
import Loader from "../Loader";
import { Circle } from "lucide-react";

interface SubscriptionModalProps {
  open: boolean;
  onSubscribe: () => void;
  onClose: () => void;
  isCreatingSession: boolean;
}

const SubscriptionModal: FC<SubscriptionModalProps> = ({
  onSubscribe,
  onClose,
  isCreatingSession,
}) => {
  if (!open) return null; // don't render if closed

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 text-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4 relative max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal content */}
        <div className="space-y-6 flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold">
            Subscribe to Generate Lists Using AI ✨
          </h2>

          <div>
            <div className=" px-4 rounded-lg flex items-center gap-2">
              <Circle size={14} />{" "}
              <span className="font-medium">AI List Generation</span>
            </div>
            <div className=" px-4 rounded-lg flex items-center gap-2">
              <Circle size={14} />
              <span className="font-medium">1M Tokens</span>
            </div>
            <div className="px-4 rounded-lg flex items-center gap-2">
              <Circle size={14} />{" "}
              <span className="font-medium">Unlimited Support</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-red-700">
            <span className="text-4xl">$1</span>
            <span className="text-4xl">|</span>
            <div className="flex flex-col items-start">
              <span className="text-md m-0 p-0">PER</span>
              <span className="text-md m-0 p-0">MONTH</span>
            </div>
          </div>

          <button
            className="w-1/2 py-4 bg-red-700 hover:bg-red-800 rounded-full font-bold transition-colors"
            disabled={isCreatingSession}
            onClick={onSubscribe}
          >
            {isCreatingSession ? (
              <div className="flex items-center justify-center">
                <Loader color="white" />
              </div>
            ) : (
              "Subscribe"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
