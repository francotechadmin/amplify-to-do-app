import React, { FC } from "react";
import Loader from "../Loader"; // or wherever your Loader component is

interface SubscriptionModalProps {
  onSubscribe: () => void;
  isCreatingSession: boolean;
}

const SubscriptionModal: FC<SubscriptionModalProps> = ({
  onSubscribe,
  isCreatingSession,
}) => {
  return (
    // Fullscreen overlay (dark, slightly transparent), centered content
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      {/* The modal container */}
      <div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg max-w-3xl w-full flex flex-col md:flex-row gap-8">
        {/* Left column: subscription details */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">Unlock Premium Features</h2>
          <p className="text-gray-300">
            Subscribe to our premium plan to gain full access to advanced
            features, priority support, and more. Your support helps us continue
            building great tools!
          </p>
          <div className="mt-2">
            <p className="text-xl">
              <strong className="text-blue-400">$9.99/month</strong>
            </p>
            <p className="text-sm text-gray-400 mt-1">
              You can cancel anytime in your account settings.
            </p>
          </div>
        </div>

        {/* Right column: call-to-action */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center gap-4">
          <button
            className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md w-full text-center"
            disabled={isCreatingSession}
            onClick={onSubscribe}
          >
            {isCreatingSession ? <Loader /> : "Subscribe Now"}
          </button>
          <p className="text-sm text-gray-400">
            Your subscription will renew monthly until canceled.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
