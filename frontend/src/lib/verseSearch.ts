import { ALL_VERSES, Verse } from "@/src/data/content";

const normalize = (value: string) => value
  .toLocaleLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^\p{L}\p{N}.]+/gu, " ")
  .trim();

export function searchVerses(query: string, limit = 100): Verse[] {
  const needle = normalize(query);
  if (!needle) return [];
  return ALL_VERSES.filter((verse) => normalize([
    verse.ref, verse.sa, verse.iast, verse.en, verse.te,
  ].filter(Boolean).join(" ")).includes(needle)).slice(0, limit);
}
