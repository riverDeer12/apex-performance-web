import { Injectable, computed, effect, signal } from "@angular/core";
import { Language, translations } from "./translations";

const STORAGE_KEY = "lang";

export interface LanguageOption {
  code: Language;
  // Name of the language in that language, so everyone finds their own.
  name: string;
  locale: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "hr", name: "Hrvatski", locale: "hr-HR" },
  { code: "en", name: "English", locale: "en-GB" },
  { code: "it", name: "Italiano", locale: "it-IT" },
  { code: "de", name: "Deutsch", locale: "de-DE" },
];

function storedLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.some((x) => x.code === stored) ? (stored as Language) : "hr";
  } catch {
    return "hr";
  }
}

@Injectable({ providedIn: "root" })
export class TranslationService {
  readonly languages = LANGUAGES;

  language = signal<Language>(storedLanguage());

  isEnglish = computed(() => this.language() === "en");

  // Locale for formatting dates and numbers in the current language.
  locale = computed(() => LANGUAGES.find((x) => x.code === this.language())?.locale ?? "hr-HR");

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, this.language());
      } catch {
      }
    });
  }

  setLanguage(language: Language): void {
    this.language.set(language);
  }

  // Missing keys fall back to English, so new texts never show as keys.
  t(key: string): string {
    return translations[this.language()][key] ?? translations.en[key] ?? key;
  }
}
