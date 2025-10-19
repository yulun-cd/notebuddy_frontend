import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import { LoadingScreen } from "./_layout";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  console.log(isAuthenticated);
  return isAuthenticated ? (
    <Redirect href="/(tabs)/home" />
  ) : (
    <Redirect href="/login" />
  );
}
