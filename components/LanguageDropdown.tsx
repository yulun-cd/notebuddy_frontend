import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React, { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface LanguageDropdownProps {
  value: string;
  onChange: (language: string) => void;
  placeholder?: string;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select language",
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const languages = [
    { code: "en", name: "English" },
    { code: "zh", name: "中文" },
  ];

  const getDisplayValue = () => {
    if (!value) return placeholder;
    const language = languages.find((lang) => lang.code === value);
    return language ? language.name : placeholder;
  };

  const handleLanguageSelect = (languageCode: string) => {
    onChange(languageCode);
    setIsModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsModalVisible(true)}
      >
        <ThemedText type="default" style={styles.dropdownText}>
          {getDisplayValue()}
        </ThemedText>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <ThemedView style={styles.modalContent}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.option,
                  value === language.code && styles.selectedOption,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <ThemedText
                  type="default"
                  style={[
                    styles.optionText,
                    value === language.code && styles.selectedOptionText,
                  ]}
                >
                  {language.name}
                </ThemedText>
                {value === language.code && (
                  <ThemedText type="default" style={styles.checkmark}>
                    ✓
                  </ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 40,
    justifyContent: "center",
  },
  dropdownText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "80%",
    maxWidth: 300,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  selectedOption: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  checkmark: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
