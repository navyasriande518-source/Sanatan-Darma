// Devanagari -> Telugu script transliteration. The two Unicode blocks are
// parallel (offset 0x300), so Sanskrit text renders faithfully in Telugu script.
export function toTelugu(s: string): string {
  let out = "";
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (ch === "ॐ") out += "ఓం";
    else if (ch === "।" || ch === "॥") out += ch;
    else if (c >= 0x0900 && c <= 0x097f) out += String.fromCodePoint(c + 0x300);
    else out += ch;
  }
  return out;
}
