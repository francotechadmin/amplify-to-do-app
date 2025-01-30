// hooks/useSubscription.ts

import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";

import { getUser } from "@/graphql/queries";
import { createCheckoutSession } from "@/graphql/mutations";

const stripePromise = loadStripe(
  "pk_live_51QXDiXCS09edeMLjE4XQUcBEUvkq91tPgbyzjVm5I12mG1l8i3eAaHetTzb5iuDsyHPpx1mocaJlKykqfNPp76dG00BnoFGQ0H"
); // replace with your key
const client = generateClient({ authMode: "userPool" });

/**
 * 1) Fetch subscription status for the current user.
 */
async function fetchSubscriptionStatus() {
  const user = await getCurrentUser();
  const userAttributes = await fetchUserAttributes();
  const userId = user.username;

  // Just in case you want the email for something else:
  // const email = userAttributes.email;

  const response = await client.graphql({
    query: getUser,
    variables: { id: userId },
  });

  return response.data.getUser?.subscriptionStatus;
}

/**
 * 2) Create a Stripe checkout session for the current user.
 */
async function createCheckout() {
  const user = await getCurrentUser();
  const userAttributes = await fetchUserAttributes();

  const userId = user.username;
  const email = userAttributes.email || "";

  // Call your custom mutation to create the checkout session
  const response = await client.graphql({
    query: createCheckoutSession,
    variables: {
      input: {
        planId: "price_1Qn0mZCS09edeMLjrPpKagrm", // your plan ID
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
