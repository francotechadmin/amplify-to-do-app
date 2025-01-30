"use client";
import React from "react";
import { signOut } from "aws-amplify/auth"; // or wherever your signOut comes from
import { ExternalLink, LogOut, Settings } from "lucide-react";
import Loader from "../Loader";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  subscriptionStatus?: "active" | "inactive" | null;
  onSubscribe: () => void;
  onManageSubscription: () => void;
  isSubscribing?: boolean;
  isLoading?: boolean;
}

/**
 * A simple Tailwind-based modal.
 * If using shadcn Dialog, you can swap this out for <Dialog> etc.
 */
const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  subscriptionStatus,
  onSubscribe,
  onManageSubscription,
  isSubscribing,
  isLoading,
}) => {
  if (!open) return null; // don't render if closed

  const isSubscribed = subscriptionStatus === "active";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="relative bg-[#10121E] text-white p-8 pb-10 rounded-md shadow-lg w-full max-w-xs text-center"
        onClick={(e) => e.stopPropagation()} // prevent close on modal click
      >
        <div className="flex gap-1 items-center justify-center mb-8">
          <h2 className="text-xl font-bold">Settings</h2>
          <Settings size={20} color="white" />
        </div>

        {/* Subscription Section */}
        {!isSubscribed ? (
          <button
            className="w-full bg-white hover:opacity-75 text-red-600 py-2 px-4 rounded-full mb-2"
            onClick={() => {
              onSubscribe();
              onClose(); // optionally close after they pick Subscribe
            }}
          >
            {isSubscribing || isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader color="red" />
              </div>
            ) : (
              "Subscribe to AI features ✨"
            )}
          </button>
        ) : (
          <button
            className="w-full bg-white hover:opacity-75 text-red-600 py-2 px-4 rounded-full mb-2 flex items-center justify-center"
            onClick={() => {
              onManageSubscription();
              onClose(); // optionally close after they pick Manage
            }}
          >
            Manage Subscription
            <ExternalLink size={16} className="inline ml-1" />
          </button>
        )}

        {/* Sign Out Button */}
        <button
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full flex items-center justify-center gap-1"
          onClick={() => {
            signOut();
          }}
        >
          Logout <LogOut size={16} />
        </button>

        {/* Close Button (optional) */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
