// Language registry. To add a language: add an entry to LANGUAGES, create a
// dictionary file (copy en.ts), register it in DICTS and set enabled: true.
// Missing keys automatically fall back to English.
import { en } from "./en";
import { te } from "./te";

export type LangCode = "en" | "te" | "sa" | "hi" | "ta" | "kn" | "ml" | "mr";
export type Dict = Record<keyof typeof en, string>;

export const LANGUAGES: { code: LangCode; native: string; name: string; enabled: boolean }[] = [
  { code: "te", native: "తెలుగు", name: "Telugu", enabled: true },
  { code: "en", native: "English", name: "English", enabled: true },
  { code: "sa", native: "संस्कृतम्", name: "Sanskrit", enabled: false },
  { code: "hi", native: "हिन्दी", name: "Hindi", enabled: false },
  { code: "ta", native: "தமிழ்", name: "Tamil", enabled: false },
  { code: "kn", native: "ಕನ್ನಡ", name: "Kannada", enabled: false },
  { code: "ml", native: "മലയാളം", name: "Malayalam", enabled: false },
  { code: "mr", native: "मराठी", name: "Marathi", enabled: false },
];

const DICTS: Partial<Record<LangCode, Partial<Dict>>> = { en, te };

export type TKey = keyof typeof en;

export function translate(lang: LangCode, key: TKey, vars?: Record<string, string | number>): string {
  let s = (DICTS[lang]?.[key] as string) ?? en[key] ?? key;
  if (vars) for (const k of Object.keys(vars)) s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k]));
  return s;
}

export function langLabel(code: LangCode) {
  return LANGUAGES.find((l) => l.code === code)?.native ?? code;
}
