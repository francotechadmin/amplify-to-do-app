import React, { ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";

import { getUser } from "@/graphql/queries";
import { createCheckoutSession } from "@/graphql/mutations";

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

  console.log("userId", userId);
  console.log("email", email);

  const response = await client.graphql({
    query: getUser,
    variables: { id: userId },
  });
  console.log("response", response);

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
      input: { planId: "price_1QXDnXCS09edeMLj3ARwc1kP", userId, email }, // Replace with your price ID
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

const Loader = () => (
  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
);

interface SubscriptionGuardProps {
  children: ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  /**
   * Use React Query to fetch subscription status
   */
  const {
    data: subscriptionStatus,
    isLoading: isCheckingSubscription,
    error: subscriptionError,
  } = useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: fetchSubscriptionStatus,
  });

  /**
   * Use React Query mutation for creating the checkout session
   */
  const {
    mutate: handleSubscribe,
    isPending: isCreatingSession,
    error: createCheckoutError,
  } = useMutation({
    mutationFn: createCheckout,
  });

  if (isCheckingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // You can handle errors in a way that makes sense for your app.
  // For instance, show a user-friendly message or handle 401/403 responses differently.
  if (subscriptionError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">
          Error checking subscription: {(subscriptionError as Error).message}
        </p>
      </div>
    );
  }

  // You can also handle checkout creation errors separately if needed:
  if (createCheckoutError) {
    console.error("Error creating checkout session:", createCheckoutError);
  }

  const isSubscribed = subscriptionStatus === "active";

  if (!isSubscribed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p>You need to subscribe to access this page.</p>
        <button
          onClick={() => handleSubscribe()}
          className="px-4 py-2 text-white bg-blue-500 rounded-md"
          disabled={isCreatingSession}
        >
          {isCreatingSession ? (
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Subscribe"
          )}
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
