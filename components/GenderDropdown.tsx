import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AntDesign } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface GenderDropdownProps {
  value: "Male" | "Female" | null;
  onChange: (value: "Male" | "Female" | null) => void;
  placeholder?: string;
}

const GENDER_OPTIONS = [
  { label: "未设置", value: null },
  { label: "男", value: "Male" as const },
  { label: "女", value: "Female" as const },
];

export const GenderDropdown: React.FC<GenderDropdownProps> = ({
  value,
  onChange,
  placeholder = "请选择性别",
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (selectedValue: "Male" | "Female" | null) => {
    onChange(selectedValue);
    setModalVisible(false);
  };

  const getDisplayValue = () => {
    const selectedOption = GENDER_OPTIONS.find(
      (option) => option.value === value
    );
    return selectedOption ? selectedOption.label : placeholder;
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <ThemedText type="default" style={styles.dropdownText}>
          {getDisplayValue()}
        </ThemedText>
        <AntDesign name="down" size={16} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <ThemedView style={styles.modalContent}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.option,
                  value === option.value && styles.selectedOption,
                ]}
                onPress={() => handleSelect(option.value)}
              >
                <ThemedText
                  type="default"
                  style={[
                    styles.optionText,
                    value === option.value && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </ThemedText>
                {value === option.value && (
                  <AntDesign name="check" size={16} color="#007AFF" />
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
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dropdownText: {
    fontSize: 14,
    color: "#333",
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
