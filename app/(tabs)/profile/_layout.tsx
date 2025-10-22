import { AntDesign } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";

export default function ProfileLayout() {
  const { t } = useTranslation();

  const handleSettings = () => {
    router.push("/profile/settings");
  };

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: t("nav.profile"),
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              style={{
                paddingVertical: 6,
                borderRadius: 6,
                marginRight: 16,
              }}
              onPress={handleSettings}
            >
              <AntDesign name="setting" size={20} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: t("settings.title"),
          headerBackTitle: t("common.back"),
        }}
      />
    </Stack>
  );
}
