// hooks/useUser.ts
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { getUser } from "@/graphql/queries";
import { createUser } from "@/graphql/mutations";
import { useQuery } from "@tanstack/react-query";

const client = generateClient({ authMode: "userPool" });

const fetchUserQuery = async (userId: string) => {
  const response = await client.graphql({
    query: getUser,
    variables: { id: userId },
  });
  return response.data.getUser;
};

const createUserQuery = async (userId: string) => {
  return await client.graphql({
    query: createUser,
    variables: {
      input: { id: userId, subscriptionStatus: "inactive", freeQueriesUsed: 0 },
    },
  });
};

export async function handleCreateUser(
  setShowWelcomeModal: (show: boolean) => void
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return;

  try {
    const data = await fetchUserQuery(currentUser.username);
    if (!data) {
      await createUserQuery(currentUser.username);
      setShowWelcomeModal(true);
    }
  } catch (error) {
    console.error("Error fetching or creating user:", error);
  }
}

/**
 * Use this hook anywhere you need the user’s subscription status & free queries.
 */
export function useUserData() {
  // Key your query in a way that is unique to the user
  return useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) return null;
      return await fetchUserQuery(currentUser.username);
    },
    // Optional: refetchOnWindowFocus: false,
    // Optional: staleTime, etc.
  });
}
