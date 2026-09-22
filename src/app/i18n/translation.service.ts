import { Injectable, computed, effect, signal } from "@angular/core";
import { Language, translations } from "./translations";

const STORAGE_KEY = "lang";

@Injectable({ providedIn: "root" })
export class TranslationService {
  language = signal<Language>(
    localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "hr",
  );

  isEnglish = computed(() => this.language() === "en");

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, this.language());
    });
  }

  setLanguage(language: Language): void {
    this.language.set(language);
  }

  toggleLanguage(): void {
    this.language.set(this.language() === "en" ? "hr" : "en");
  }

  t(key: string): string {
    return translations[this.language()][key] ?? key;
  }
}
