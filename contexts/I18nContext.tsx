import { useUserProfile } from "@/contexts/UserProfileContext";
import i18n from "@/services/i18n";
import React, { createContext, ReactNode, useContext, useEffect } from "react";

interface I18nContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const { userProfile } = useUserProfile();

  // Update language when user profile changes
  useEffect(() => {
    if (userProfile?.language) {
      const userLanguage = userProfile.language.toLowerCase();
      // Map user language to supported languages
      if (
        userLanguage === "zh" ||
        userLanguage === "zh-cn" ||
        userLanguage === "zh-hans"
      ) {
        i18n.changeLanguage("zh");
      } else {
        i18n.changeLanguage("en");
      }
    } else {
      // Default to English if no language in profile
      i18n.changeLanguage("en");
    }
  }, [userProfile?.language]);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const value: I18nContextType = {
    currentLanguage: i18n.language,
    changeLanguage,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
