// hooks/useSubscription.ts

import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";

import { getUser } from "@/graphql/queries";
import { createCheckoutSession } from "@/graphql/mutations";

// look at url in browser console to see if it's in production or development
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY;

// Load Stripe.js
const stripePromise = loadStripe(stripeKey!);

const client = generateClient({ authMode: "userPool" });

/**
 * Fetch subscription status for the current user.
 */
async function fetchSubscriptionStatus() {
  const user = await getCurrentUser();
  const userId = user.username;

  const response = await client.graphql({
    query: getUser,
    variables: { id: userId },
  });

  return response.data.getUser?.subscriptionStatus ?? null;
}

/**
 * 2) Create a Stripe checkout session for the current user.
 */
async function createCheckout() {
  const user = await getCurrentUser();
  const userAttributes = await fetchUserAttributes();

  const userId = user.username;
  const email = userAttributes.email || "";

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

  const response = await client.graphql({
    query: createCheckoutSession,
    variables: {
      input: {
        planId: priceId ?? "",
        userId,
        email,
      },
    },
  });

  // Redirect to Stripe checkout
  const stripe = await stripePromise;
  if (!stripe) throw new Error("Stripe failed to load");

  const { id } = response.data.createCheckoutSession;
  const { error } = await stripe.redirectToCheckout({ sessionId: id });
  if (error) throw new Error(error.message);
}

/**
 * Custom hook that returns subscription status + a checkout method.
 */
export function useSubscription() {
  // Query subscription status
  const {
    data: subscriptionStatus,
    isLoading: isCheckingSubscription,
    error: subscriptionError,
  } = useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: fetchSubscriptionStatus,
  });

  // Mutation to create checkout session
  const {
    mutate: handleSubscribe,
    isPending: isCreatingSession,
    error: createCheckoutError,
  } = useMutation({ mutationFn: createCheckout });

  return {
    subscriptionStatus,
    isCheckingSubscription,
    subscriptionError,

    handleSubscribe,
    isCreatingSession,
    createCheckoutError,
  };
}
