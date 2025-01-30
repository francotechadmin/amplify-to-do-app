"use client";
import React, { ReactNode, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";

import { getUser } from "@/graphql/queries";
import { createCheckoutSession } from "@/graphql/mutations";
import SubscriptionModal from "../SubscriptionModal"; // import the modal
import Loader from "../Loader"; // or wherever your Loader component is

const stripePromise = loadStripe(
  "pk_test_51QXDiXCS09edeMLjcjsyf3wEmSJxZwNh8gOq1ZAwtBFB1j2sttJ7j167899jmESQyaRpmqLQTRxKEBXnYbDmIPy400LjCSpVHb"
);

const client = generateClient({ authMode: "userPool" });

/**
 * Fetch user subscription status.
 */
const fetchSubscriptionStatus = async () => {
  const user = await getCurrentUser();
  const userAttributes = await fetchUserAttributes();
  const userId = user.username;
  const email = userAttributes.email || "";

  // If desired, console.log to debug:
  // console.log("userId", userId);
  // console.log("email", email);

  const response = await client.graphql({
    query: getUser,
    variables: { id: userId },
  });

  return response.data.getUser?.subscriptionStatus;
};

/**
 * Create a Stripe checkout session.
 */
const createCheckout = async () => {
  const user = await getCurrentUser();
  const userAttributes = await fetchUserAttributes();
  const userId = user.username;
  const email = userAttributes.email || "";

  const response = await client.graphql({
    query: createCheckoutSession,
    variables: {
      input: { planId: "price_1QXDnXCS09edeMLj3ARwc1kP", userId, email },
    },
  });

  const stripe = await stripePromise;

  if (stripe) {
    const { id } = response.data.createCheckoutSession;
    const { error } = await stripe.redirectToCheckout({ sessionId: id });
    if (error) {
      console.error("Stripe failed to redirect to checkout:", error);
    }
  } else {
    console.error("Stripe failed to load.");
  }
};

interface SubscriptionGuardProps {
  children: ReactNode;
  onClose: () => void;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  onClose,
}) => {
  // Track whether the modal is open
  const [isModalOpen, setIsModalOpen] = useState(true);

  // 1) Query subscription status
  const {
    data: subscriptionStatus,
    isLoading: isCheckingSubscription,
    error: subscriptionError,
  } = useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: fetchSubscriptionStatus,
  });

  // 2) Mutation to create checkout session
  const {
    mutate: handleSubscribe,
    isPending: isCreatingSession,
    error: createCheckoutError,
  } = useMutation({
    mutationFn: createCheckout,
  });

  // Handle closing the modal
  const handleClose = () => {
    setIsModalOpen(false);
    onClose();
  };

  // Show the modal if the subscription is not active
  useEffect(() => {
    if (subscriptionStatus && subscriptionStatus == "active") {
      setIsModalOpen(false);
    } else {
      setIsModalOpen(true);
    }
  }, [subscriptionStatus]);

  if (isCheckingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // if (subscriptionError) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <p className="text-red-600">
  //         Error checking subscription: {(subscriptionError as Error).message}
  //       </p>
  //     </div>
  //   );
  // }

  // You can handle createCheckoutError here if needed
  if (createCheckoutError) {
    console.error("Error creating checkout session:", createCheckoutError);
  }

  if (subscriptionStatus && subscriptionStatus == "inactive") {
    return <>{children}</>;
  }

  // RENDER:
  //  - The child content (so the page is loaded behind the overlay)
  //  - The subscription modal if user is not active
  return (
    <>
      {isModalOpen && (
        <SubscriptionModal
          onSubscribe={() => handleSubscribe()}
          isCreatingSession={isCreatingSession}
          open={isModalOpen}
          onClose={() => handleClose()}
        />
      )}
    </>
  );
};

export default SubscriptionGuard;
