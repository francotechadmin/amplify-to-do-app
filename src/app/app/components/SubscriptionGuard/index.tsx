import React, { useEffect, useState } from "react";
import { ReactNode } from "react";
import { getUser } from "@/graphql/queries"; // Replace with your user query
import { createCheckoutSession } from "@/graphql/mutations";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(
  "pk_test_51QXDiXCS09edeMLjcjsyf3wEmSJxZwNh8gOq1ZAwtBFB1j2sttJ7j167899jmESQyaRpmqLQTRxKEBXnYbDmIPy400LjCSpVHb"
);

const client = generateClient({ authMode: "userPool" });

const fetchSubscriptionStatus = async () => {
  const user = await getCurrentUser();
  const userId = user.username;
  const response = await client.graphql({
    query: getUser,
    variables: { id: userId },
  });
  return response.data.getUser?.subscriptionStatus;
};

const handleSubscribe = async () => {
  const user = await getCurrentUser();
  const userAttributes = await fetchUserAttributes();

  const userId = user.username;
  const email = userAttributes.email || "";

  const response = await client.graphql({
    query: createCheckoutSession,
    variables: {
      input: { planId: "price_1QXDnXCS09edeMLj3ARwc1kP", userId, email },
    }, // Replace with your price ID from Stripe
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

const SubscriptionGuard = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const subscriptionStatus = await fetchSubscriptionStatus();
        if (subscriptionStatus === "active") {
          setIsSubscribed(true);
        } else {
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <p>You need to subscribe to access this page.</p>

        <button
          onClick={handleSubscribe}
          className="px-4 py-2 text-white bg-blue-500 rounded-md"
        >
          Subscribe
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
