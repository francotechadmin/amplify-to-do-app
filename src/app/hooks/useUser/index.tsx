// hooks/useUser.ts
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { getUser } from "@/graphql/queries";
import { createUser } from "@/graphql/mutations";

const client = generateClient({ authMode: "userPool" });

const fetchUserQuery = async (userId: string) => {
  const response = await client.graphql({
    query: getUser,
    variables: { id: userId },
  });
  return response.data;
};

const createUserQuery = async (userId: string) => {
  return await client.graphql({
    query: createUser,
    variables: { input: { id: userId, subscriptionStatus: "inactive" } },
  });
};

export async function handleCreateUser(
  setShowWelcomeModal: (show: boolean) => void
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return;

  try {
    const data = await fetchUserQuery(currentUser.username);
    if (!data?.getUser) {
      await createUserQuery(currentUser.username);
      setShowWelcomeModal(true);
    }
  } catch (error) {
    console.error("Error fetching or creating user:", error);
  }
}
