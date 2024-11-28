import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../utils/cn';
import { useGameStore } from '../store/gameStore';
import { Globe } from 'lucide-react';

type Language = {
  code: string;
  name: string;
  flag: string;
};

const languages: Language[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];
  const setLanguage = useGameStore(state => state.setLanguage);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const storedLang = localStorage.getItem('i18nextLng');
    if (storedLang && storedLang !== i18n.language) {
      i18n.changeLanguage(storedLang);
      setLanguage(storedLang);
    }
  }, [i18n, setLanguage]);

  const handleLanguageChange = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      setLanguage(lang);
      localStorage.setItem('i18nextLng', lang);
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 language-selector">
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={cn(
            "group flex items-center gap-2 px-3 py-2 rounded-full",
            "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
            "shadow-lg hover:shadow-xl transition-all duration-300",
            "border border-gray-200/50 dark:border-gray-700/50",
            "hover:bg-white dark:hover:bg-gray-800",
            "transform hover:scale-105",
            isOpen && "ring-2 ring-blue-400 dark:ring-blue-500"
          )}
          title={currentLang.name}
        >
          <Globe className={cn(
            "w-4 h-4 transition-all duration-300",
            isOpen 
              ? "text-blue-500 dark:text-blue-400 rotate-180" 
              : "text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
          )} />
          <span className="text-lg">{currentLang.flag}</span>
        </button>

        <div className={cn(
          "absolute top-12 left-0",
          "transform transition-all duration-300",
          "animate-in fade-in zoom-in-95",
          isOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
        )}>
          <div className={cn(
            "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
            "rounded-2xl shadow-xl",
            "border border-gray-200/50 dark:border-gray-700/50",
            "p-2 min-w-[180px]",
            "divide-y divide-gray-100 dark:divide-gray-700/50",
            "animate-in slide-in-from-top-2"
          )}>
            {languages.map((lang, index) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "w-full px-4 py-2 flex items-center gap-3",
                  "transition-all duration-200",
                  "first:rounded-t-xl last:rounded-b-xl",
                  "hover:pl-6",
                  currentLang.code === lang.code
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                )}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <span className={cn(
                  "text-xl transition-all duration-200",
                  "transform hover:scale-110",
                  currentLang.code === lang.code && "animate-bounce"
                )}>
                  {lang.flag}
                </span>
                <span className={cn(
                  "font-medium transition-all duration-200",
                  currentLang.code === lang.code && "font-bold"
                )}>
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}