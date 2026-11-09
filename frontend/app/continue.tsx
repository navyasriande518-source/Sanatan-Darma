import { Redirect } from "expo-router";

import { getChapter, getVerse } from "@/src/data/content";
import { useApp } from "@/src/store/AppContext";

// "Continue Reading" deep link: jump to the last saved reading position.
export default function Continue() {
  const { lastRead } = useApp();
  if (!lastRead) return <Redirect href="/reader/bhagavad-gita?chapter=7" />;
  const c = getChapter(lastRead.chapterId);
  const v = lastRead.verseId ? getVerse(lastRead.verseId) : undefined;
  return <Redirect href={`/reader/${lastRead.id}?chapter=${c?.number ?? 1}${v ? `&verse=${v.n}` : ""}` as any} />;
}
