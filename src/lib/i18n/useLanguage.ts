'use client';

import { create } from 'zustand';
import { Language, translations, Translations } from './translations';

interface LanguageState {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  initLanguage: () => void;
}

export const useLanguage = create<LanguageState>((set) => ({
  language: 'de',
  t: translations.de,
  setLanguage: (lang: Language) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('app_language', lang);
      } catch (e) {
        console.error(e);
      }
    }
    set({
      language: lang,
      t: translations[lang] || translations.de,
    });
  },
  initLanguage: () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('app_language') as Language;
        if (saved && ['de', 'uk', 'en'].includes(saved)) {
          set({
            language: saved,
            t: translations[saved] || translations.de,
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  },
}));
