// SubscriptionGuard.tsx

"use client";
import React, { ReactNode, useState, useEffect } from "react";
import SubscriptionModal from "../SubscriptionModal";
import Loader from "../Loader";
import { useSubscription } from "../../hooks/useSubscriptionStatus";

interface SubscriptionGuardProps {
  children: ReactNode;
  onClose: () => void;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  onClose,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check subscription status
  const {
    subscriptionStatus,
    isCheckingSubscription,
    subscriptionError,
    handleSubscribe,
    isCreatingSession,
  } = useSubscription();

  useEffect(() => {
    if (subscriptionStatus === "active") {
      setIsModalOpen(false);
    } else {
      setIsModalOpen(true);
    }
  }, [subscriptionStatus]);

  const handleClose = () => {
    setIsModalOpen(false);
    onClose();
  };

  if (isCheckingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader color="white" />
      </div>
    );
  }

  if (subscriptionError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">
          Error checking subscription: {(subscriptionError as Error).message}
        </p>
      </div>
    );
  }

  // If subscription is active, just render the children
  if (subscriptionStatus === "active") {
    return <>{children}</>;
  }

  // Otherwise, show the modal to prompt the user to subscribe
  return (
    <>
      {isModalOpen && (
        <SubscriptionModal
          onSubscribe={handleSubscribe} // calls Stripe checkout
          isCreatingSession={isCreatingSession}
          open={isModalOpen}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default SubscriptionGuard;
