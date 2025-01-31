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

  // 1) Use our custom hook
  const {
    subscriptionStatus,
    isCheckingSubscription,
    subscriptionError,
    handleSubscribe,
    isCreatingSession,
    createCheckoutError,
  } = useSubscription();

  // 2) If we're still checking subscription, show a loader
  if (isCheckingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader color="white" />
      </div>
    );
  }

  // If there's an error checking subscription, handle it (optional)
  if (subscriptionError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">
          Error checking subscription: {(subscriptionError as Error).message}
        </p>
      </div>
    );
  }

  // If there's an error creating the checkout session, you can log or show a warning
  if (createCheckoutError) {
    console.error("Error creating checkout session:", createCheckoutError);
  }

  // 3) Decide whether to show the modal or not
  useEffect(() => {
    if (subscriptionStatus === "active") {
      setIsModalOpen(false);
    } else {
      setIsModalOpen(true);
    }
  }, [subscriptionStatus]);

  // 4) Close handler
  const handleClose = () => {
    setIsModalOpen(false);
    onClose();
  };

  // If subscription is active, just render the children
  if (subscriptionStatus === "active") {
    return <>{children}</>;
  }

  // Otherwise, show the modal (and optionally render children behind an overlay)
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
