"use client"; // If you are using Next.js 13+ with the app router and need client components
import React, { useState } from "react";
import { PenLine, Settings } from "lucide-react";
import SettingsModal from "../SettingsModal";
import { useSubscription } from "../../../hooks/useSubscriptionStatus";
import Loader from "../Loader";

const NavBar: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const {
    subscriptionStatus,
    isCheckingSubscription,
    handleSubscribe,
    isCreatingSession,
  } = useSubscription();

  if (isCheckingSubscription) return <Loader />;

  return (
    <nav className="flex items-center justify-between w-full px-6 py-4 text-white">
      {/* <div style={{ width: "20px" }}></div> */}
      <div className="text-3xl font-bold flex items-center gap-2">
        To-Do List <PenLine size={28} />
      </div>
      <button
        onClick={() => setShowSettings(true)}
        className="text-red py-1 rounded"
      >
        {/* sign out icon */}
        <Settings color="red" size={22} />
      </button>
      {/* TODO: tie in subscription logic */}
      {/* The modal can be conditionally rendered here */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        subscriptionStatus={
          subscriptionStatus === "active" ? "active" : "inactive"
        }
        onSubscribe={() => handleSubscribe()}
        onManageSubscription={() => {}}
      />
    </nav>
  );
};

export default NavBar;
