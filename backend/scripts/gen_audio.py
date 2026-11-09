"""One-time generator for the bundled DEMO narration of Bhagavad Gita Chapter 7.

Creates assets/audio/gita7_te.mp3 and gita7_en.mp3 plus per-verse timestamp
metadata (src/data/audioTimings.json). Run: python scripts/gen_audio.py
The app itself never calls any API; it plays the bundled files offline.
"""
import asyncio, json, os, subprocess, sys
from pathlib import Path
from dotenv import load_dotenv
from mutagen.mp3 import MP3
import imageio_ffmpeg
from emergentintegrations.llm.openai import OpenAITextToSpeech

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / "backend" / ".env")
FE = ROOT / "frontend"
DATA = json.loads((FE / "src/data/gita7.json").read_text())
OUT = FE / "assets/audio"
TMP = Path("/tmp/tts")
OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
GAP = 0.7


def to_telugu(s: str) -> str:
    out = []
    for ch in s:
        c = ord(ch)
        if ch == "ॐ":
            out.append("ఓం")
        elif ch in "।॥":
            out.append(ch)
        elif 0x0900 <= c <= 0x097F:
            out.append(chr(c + 0x300))
        else:
            out.append(ch)
    return "".join(out)


def text_for(v, lang):
    if lang == "te":
        sa = to_telugu(v["sa"]).replace("।", ",").replace("॥", ".").replace("\n", " ")
        return f"{sa} ... {v['te']}"
    return f"Verse seven point {v['n']}. {v['en']}"


INSTR = {
    "te": "Speak in Telugu. Recite the Sanskrit shloka slowly and reverently like a temple chant, then explain the meaning calmly in Telugu.",
    "en": "Speak slowly, calmly and reverently, like a narrator reading sacred scripture.",
}


async def main():
    tts = OpenAITextToSpeech(api_key=os.getenv("EMERGENT_LLM_KEY"))
    silence = TMP / "gap.mp3"
    subprocess.run([FFMPEG, "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(GAP), "-q:a", "9", str(silence)], check=True, capture_output=True)
    timings = {}
    for lang in ["te", "en"]:
        parts, segs, t = [], [], 0.0
        for v in DATA["verses"]:
            f = TMP / f"{lang}_{v['n']}.mp3"
            if not f.exists():
                audio = await tts.generate_speech(text=text_for(v, lang), model="gpt-4o-mini-tts", voice="sage", instructions=INSTR[lang])
                f.write_bytes(audio)
                print("generated", f)
            # re-encode each piece for a uniform stream
            norm = TMP / f"n_{lang}_{v['n']}.mp3"
            subprocess.run([FFMPEG, "-y", "-i", str(f), "-ar", "24000", "-ac", "1", "-b:a", "64k", str(norm)], check=True, capture_output=True)
            d = MP3(str(norm)).info.length
            segs.append({"verse": v["n"], "start": round(t, 2), "end": round(t + d, 2)})
            t += d + GAP
            parts += [norm, silence]
        lst = TMP / f"list_{lang}.txt"
        lst.write_text("".join(f"file '{p}'\n" for p in parts))
        dest = OUT / f"gita7_{lang}.mp3"
        subprocess.run([FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-ar", "24000", "-ac", "1", "-b:a", "64k", str(dest)], check=True, capture_output=True)
        timings[lang] = {"duration": round(MP3(str(dest)).info.length, 2), "segments": segs, "bytes": dest.stat().st_size}
    (FE / "src/data/audioTimings.json").write_text(json.dumps(timings, indent=1))
    print("done", json.dumps(timings)[:300])


if __name__ == "__main__":
    asyncio.run(main())
