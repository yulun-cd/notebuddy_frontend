import { ThemedText } from "@/components/themed-text";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";

export default function HomeLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: t("home.headerTitle"),
          headerRight: () => (
            <TouchableOpacity
              style={{
                backgroundColor: "#007AFF",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                marginRight: 16,
              }}
              onPress={() => router.push("/home/createTranscript")}
            >
              <ThemedText
                type="defaultSemiBold"
                style={{
                  color: "white",
                  fontSize: 14,
                }}
              >
                {t("home.addButton")}
              </ThemedText>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
      <Stack.Screen
        name="transcript"
        options={{
          title: t("screen.transcript"),
          headerBackTitle: t("common.back"),
        }}
      />
      <Stack.Screen
        name="note"
        options={{
          title: t("screen.note"),
          headerBackTitle: t("common.back"),
        }}
      />
      <Stack.Screen
        name="answer"
        options={{
          title: t("screen.answer"),
          headerBackTitle: t("common.back"),
        }}
      />
      <Stack.Screen
        name="createTranscript"
        options={{
          title: t("screen.createTranscript"),
          headerBackTitle: t("common.back"),
        }}
      />
    </Stack>
  );
}
