import React from 'react';
import { cn } from '../utils/cn';

type Language = {
  code: string;
  name: string;
  flag: string;
};

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
];

export function LanguageSelector() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentLang, setCurrentLang] = React.useState(languages[0]);

  return (
    <div className="fixed top-4 left-4">
      <div className="relative">
        {/* Bouton principal */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "text-xl shadow-lg hover:shadow-xl transition-shadow duration-300",
            "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700",
            "border-2 border-gray-200 dark:border-gray-700"
          )}
          title={currentLang.name}
        >
          <span className="text-2xl">{currentLang.flag}</span>
        </button>

        {/* Menu déroulant */}
        {isOpen && (
          <div className="absolute top-12 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[160px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setCurrentLang(lang);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2 text-left flex items-center gap-3",
                  "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                  currentLang.code === lang.code && "bg-blue-50 dark:bg-blue-900/50"
                )}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}