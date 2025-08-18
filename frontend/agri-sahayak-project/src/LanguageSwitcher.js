import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
          i18n.language === "en"
            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("hi")}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
          i18n.language === "hi"
            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        हिं
      </button>
    </div>
  );
};

export default LanguageSwitcher;
