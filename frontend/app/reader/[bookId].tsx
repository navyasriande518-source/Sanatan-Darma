import * as Clipboard from "expo-clipboard";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, BackHandler, Pressable, ScrollView, Share, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/src/components/AppHeader";
import { ReaderSettingsSheet } from "@/src/components/ReaderSettings";
import { Sheet } from "@/src/components/Sheet";
import { EmptyState, FONTS, GoldButton, Icon, Txt, fmtTime } from "@/src/components/ui";
import { Verse, getBook, getTrack } from "@/src/data/content";
import { getPlayer, stopPlayer } from "@/src/lib/player";
import { toTelugu } from "@/src/lib/translit";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, radius, readerThemes, spacing, useTheme } from "@/src/theme";

const SPEEDS = [0.75, 0.9, 1, 1.25, 1.5];
const VOLUMES = [1, 0.6, 0.3, 0];

export default function Reader() {
  const params = useLocalSearchParams<{ bookId: string; chapter?: string; verse?: string }>();
  const app = useApp();
  const { prefs, t, L, setPrefs, toast, bookmarks, notes } = app;
  const book = getBook(params.bookId)!;
  const insets = useSafeAreaInsets();
  const s = useStyles();
  const { colors } = useTheme();

  const firstNum = book.chapters.find((c) => c.verses.length)?.number ?? 1;
  const [chNum, setChNum] = useState(Number(params.chapter ?? firstNum));
  const chapter = book.chapters.find((c) => c.number === chNum) ?? book.chapters[0];
  const verses = chapter?.verses ?? [];
  const [selected, setSelected] = useState<number | null>(params.verse ? Number(params.verse) : verses[0]?.n ?? null);
  const [sheet, setSheet] = useState<null | "chapters" | "verses" | "settings" | "actions" | "note">(null);
  const [actionVerse, setActionVerse] = useState<Verse | null>(null);
  const [noteText, setNoteText] = useState("");
  const scrollRef = useRef<any>(null);
  const positions = useRef<Record<number, number>>({});

  // ---------- audio ----------
  const track = chapter ? getTrack(chapter.id, prefs.audioLang) : undefined;
  const [status, setStatus] = useState({ time: 0, duration: track?.duration ?? 0, playing: false });
  const playerRef = useRef<ReturnType<typeof getPlayer> | null>(null);

  useEffect(() => {
    if (!track) { playerRef.current = null; return; }
    const p = getPlayer(track.id, track.file);
    playerRef.current = p;
    p.setPlaybackRate(prefs.speed);
    p.volume = prefs.volume;
    setStatus({ time: p.currentTime ?? 0, duration: track.duration, playing: p.playing });
    const sub = p.addListener("playbackStatusUpdate", (st: any) => {
      setStatus({ time: st.currentTime ?? 0, duration: st.duration || track.duration, playing: !!st.playing });
      if (st.didJustFinish) p.seekTo(0);
    });
    return () => { sub.remove(); p.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.id]);

  useFocusEffect(useCallback(() => {
    const bh = BackHandler.addEventListener("hardwareBackPress", () => { stopPlayer(); return false; });
    const as = AppState.addEventListener("change", (st) => { if (st !== "active") stopPlayer(); });
    return () => { bh.remove(); as.remove(); stopPlayer(); };
  }, []));

  const audioVerse = useMemo(() => {
    if (!track || !status.playing) return null;
    const seg = track.segments.find((g, i) => status.time >= g.start && status.time < (track.segments[i + 1]?.start ?? Infinity));
    return seg?.verse ?? null;
  }, [track, status.time, status.playing]);
  useEffect(() => { if (audioVerse != null) setSelected(audioVerse); }, [audioVerse]);
  const highlight = audioVerse ?? selected;

  const seekVerse = (n: number, play = true) => {
    const seg = track?.segments.find((g) => g.verse === n);
    const p = playerRef.current;
    if (!seg || !p) return;
    p.seekTo(seg.start + 0.01);
    if (play && !p.playing) p.play();
  };
  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (p.playing) p.pause();
    else {
      const cur = track?.segments.find((g, i) => status.time >= g.start && status.time < (track.segments[i + 1]?.start ?? Infinity));
      if (selected && cur?.verse !== selected) seekVerse(selected, false);
      p.play();
    }
  };
  const stepVerse = (d: number) => {
    const idx = verses.findIndex((v) => v.n === highlight);
    const next = verses[Math.max(0, Math.min(verses.length - 1, idx + d))];
    if (!next) return;
    setSelected(next.n);
    if (track && status.playing) seekVerse(next.n);
  };

  // ---------- progress, history & activity ----------
  useEffect(() => { if (chapter) app.openBook(book.id, chapter.id); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id]);
  useEffect(() => {
    if (!chapter || highlight == null) return;
    const v = verses.find((x) => x.n === highlight);
    if (!v) return;
    app.recordProgress(book.id, chapter.id, v.id);
    if (prefs.autoScroll && positions.current[highlight] != null) scrollRef.current?.scrollTo({ y: Math.max(0, positions.current[highlight] - 40), animated: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlight, chapter?.id]);
  useEffect(() => {
    if (!chapter || !verses.length) return;
    const seen = app.progress.find((p) => p.id === book.id)?.seen ?? [];
    const done = verses.every((v) => seen.includes(v.id));
    if (done && !app.activity.some((a) => a.type === "chapter_complete" && a.chapterId === chapter.id)) {
      app.logActivity({ type: "chapter_complete", bookId: book.id, chapterId: chapter.id });
      toast(t("chapterComplete"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.progress]);

  const playingRef = useRef(false);
  playingRef.current = status.playing;
  useEffect(() => {
    let read = 0, listen = 0;
    const iv = setInterval(() => {
      if (AppState.currentState !== "active") return;
      read++;
      if (playingRef.current) listen++;
      if (read >= 30) { app.logActivity({ type: "read", bookId: book.id, seconds: read }); read = 0; }
      if (listen >= 30) { app.logActivity({ type: "listen", bookId: book.id, seconds: listen }); listen = 0; }
    }, 1000);
    return () => {
      clearInterval(iv);
      if (read > 2) app.logActivity({ type: "read", bookId: book.id, seconds: read });
      if (listen > 2) app.logActivity({ type: "listen", bookId: book.id, seconds: listen });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prefs.keepAwake) activateKeepAwakeAsync("reader").catch(() => {});
    return () => { deactivateKeepAwake("reader").catch(() => {}); };
  }, [prefs.keepAwake]);

  // ---------- presentation ----------
  const rt = readerThemes[prefs.readerDark ? "dark" : prefs.readerBg];
  const te = prefs.readLang === "te";
  const bodyFont = prefs.fontFamily === "system" ? undefined : te ? (prefs.fontFamily === "traditional" ? "Gurajada" : "NotoTelugu") : prefs.fontFamily === "traditional" ? "CrimsonSemi" : "Crimson";
  const fs = prefs.fontSize;
  const lh = fs * prefs.lineSpacing;
  const chLabel = (n: number) => `${L(book.chapterLabel)} ${n}`;
  const verseText = (v: Verse) => [te ? toTelugu(v.sa) : v.iast ?? v.sa, te ? v.te ?? v.en : v.en].join("\n\n");
  const shareText = (v: Verse) => `${L(book.title, prefs.readLang)} ${v.ref}\n\n${v.sa}\n\n${verseText(v)}\n\n— ${t("appName")} ${t("appSub")}`;

  const onLong = (v: Verse) => { setActionVerse(v); setSheet("actions"); };
  const isBm = (v: Verse) => bookmarks.some((b) => b.id === v.id);

  const chIdx = book.chapters.findIndex((c) => c.number === chNum);
  const goCh = (d: number) => {
    const c = book.chapters[chIdx + d];
    if (!c) return;
    stopPlayer();
    setChNum(c.number);
    setSelected(c.verses[0]?.n ?? null);
    positions.current = {};
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const selV = verses.find((v) => v.n === highlight);
  const pct = status.duration ? (status.time / status.duration) * 100 : 0;
  const [barW, setBarW] = useState(1);

  return (
    <View style={[s.root, { backgroundColor: rt.bg }]}>
      <AppHeader back title={L(book.title, prefs.uiLang)} />
      <View style={[s.controls, { backgroundColor: rt.bg }]}>
        <Pressable testID="reader-prev-chapter" onPress={() => goCh(-1)} style={s.round} disabled={chIdx <= 0}>
          <Icon name="chevron-left" size={26} color={chIdx <= 0 ? colors.divider : colors.maroon} />
        </Pressable>
        <Pressable testID="reader-chapter-selector" onPress={() => setSheet("chapters")} style={s.select}>
          <Icon name="book-open-page-variant-outline" size={18} color={colors.maroon} />
          <Txt v="bold" size={15} color={colors.maroon} numberOfLines={1} style={{ flexShrink: 1 }}>{chLabel(chNum)}</Txt>
          <Icon name="menu-down" size={20} color={colors.maroon} />
        </Pressable>
        <Pressable testID="reader-verse-selector" onPress={() => verses.length && setSheet("verses")} style={s.select}>
          <Icon name="format-list-numbered" size={18} color={colors.maroon} />
          <Txt v="bold" size={15} color={colors.maroon} numberOfLines={1} style={{ flexShrink: 1 }}>{selV ? `${t("verse")} ${selV.ref}` : t("verse")}</Txt>
          <Icon name="menu-down" size={20} color={colors.maroon} />
        </Pressable>
        <Pressable testID="reader-next-chapter" onPress={() => goCh(1)} style={s.round} disabled={chIdx >= book.chapters.length - 1}>
          <Icon name="chevron-right" size={26} color={chIdx >= book.chapters.length - 1 ? colors.divider : colors.maroon} />
        </Pressable>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView ref={scrollRef} contentContainerStyle={s.content}>
          <View style={s.headingRow}>
            <Txt v="heading" size={16} color={colors.gold}>❖ ✦</Txt>
            <Txt testID="reader-chapter-title" v="heading" size={22} color={rt.num} style={[s.heading, { fontFamily: te ? "Ramabhadra" : "CrimsonBold" }]}>{L(chapter?.title, prefs.readLang)}</Txt>
            <Txt v="heading" size={16} color={colors.gold}>✦ ❖</Txt>
          </View>
          {!verses.length ? (
            <View>
              {chapter?.description ? <Txt size={16} color={rt.sub} style={{ textAlign: "center", marginBottom: spacing.md }}>{L(chapter.description, prefs.readLang)}</Txt> : null}
              <EmptyState testID="reader-no-verses" icon="book-clock-outline" text={t("noVerses")} />
            </View>
          ) : null}
          {verses.map((v) => {
            const active = highlight === v.n;
            const note = notes.find((n) => n.id === v.id);
            return (
              <Pressable
                key={v.id}
                testID={`verse-${v.ref}`}
                onLayout={(e) => { positions.current[v.n] = e.nativeEvent.layout.y; }}
                onPress={() => { setSelected(v.n); if (track) seekVerse(v.n); }}
                onLongPress={() => onLong(v)}
                delayLongPress={350}
                style={[s.verse, active && { backgroundColor: rt.hl, borderColor: colors.gold }]}
              >
                <View style={s.numCol}>
                  <Txt v="bold" size={16} color={rt.num}>{v.ref}</Txt>
                  {isBm(v) ? <Icon testID={`verse-bookmarked-${v.ref}`} name="bookmark" size={18} color={colors.maroon} /> : null}
                  {note ? <Icon name="note-text-outline" size={16} color={colors.gold} /> : null}
                </View>
                <View style={[s.bar, { backgroundColor: active ? colors.gold : colors.cardBorder }]} />
                <View style={{ flex: 1, gap: spacing.sm }}>
                  {v.speaker && (prefs.showOriginal || prefs.showTranslit) ? <Txt size={fs * 0.8} color={rt.sub} style={{ fontFamily: te ? FONTS.te.body : "NotoDeva" }}>{te ? toTelugu(v.speaker) : "śrībhagavān uvāca"}</Txt> : null}
                  {prefs.showOriginal ? <Txt testID={`verse-sa-${v.ref}`} style={{ fontFamily: "NotoDeva", fontSize: fs, lineHeight: lh * 1.05, color: rt.text }}>{v.sa}</Txt> : null}
                  {prefs.showTranslit ? (
                    <Txt testID={`verse-translit-${v.ref}`} style={{ fontFamily: bodyFont, fontSize: fs, lineHeight: lh, color: rt.text, fontStyle: te ? "normal" : "italic" }}>{te ? toTelugu(v.sa) : v.iast ?? v.sa}</Txt>
                  ) : null}
                  {prefs.showTranslation ? (
                    <Txt testID={`verse-translation-${v.ref}`} style={{ fontFamily: te ? FONTS.te.body : "Crimson", fontSize: fs * 0.88, lineHeight: fs * 0.88 * prefs.lineSpacing, color: rt.sub }}>{te ? v.te ?? v.en : v.en}</Txt>
                  ) : null}
                  {prefs.showNotes && v.noteEn ? <Txt size={fs * 0.72} color={rt.sub} style={{ fontStyle: "italic", fontFamily: "Crimson" }}>{v.noteEn}</Txt> : null}
                  {note ? <Txt size={fs * 0.75} color={colors.gold} style={{ fontFamily: "CrimsonSemi" }}>✎ {note.text}</Txt> : null}
                </View>
              </Pressable>
            );
          })}
          {verses.length ? <Txt size={13} color={rt.sub} style={s.source}>{t("source")}: {book.source}</Txt> : null}
          <View style={s.lotus}>
            <View style={s.line} />
            <Icon name="spa-outline" size={28} color={colors.gold} />
            <View style={s.line} />
          </View>
        </ScrollView>
        <View style={s.fabs}>
          <Pressable testID="reader-settings-button" onPress={() => setSheet("settings")} style={s.fab}><Txt v="bold" size={18} color={colors.maroon}>Aa</Txt></Pressable>
          <Pressable testID="reader-dark-toggle" onPress={() => setPrefs({ readerDark: !prefs.readerDark })} style={s.fab}><Icon name={prefs.readerDark ? "white-balance-sunny" : "weather-night"} size={22} color={colors.maroon} /></Pressable>
          <Pressable testID="reader-share-button" onPress={() => selV && Share.share({ message: shareText(selV) })} style={s.fab}><Icon name="share-variant-outline" size={22} color={colors.maroon} /></Pressable>
        </View>
      </View>

      {track ? (
        <View testID="audio-player" style={[s.player, { marginBottom: insets.bottom + spacing.sm }]}>
          <Pressable testID="audio-play-pause" onPress={togglePlay} style={s.playBtn}>
            <Icon name={status.playing ? "pause" : "play"} size={32} color={colors.ivory} />
          </Pressable>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt testID="audio-current-verse" v="bold" size={16} color={colors.maroon} numberOfLines={1}>{chLabel(chNum)} – {t("verse")} {selV?.ref ?? ""}</Txt>
            {prefs.showAudioBar ? (
              <>
                <Pressable testID="audio-progress-bar" onLayout={(e) => setBarW(e.nativeEvent.layout.width)} onPress={(e) => playerRef.current?.seekTo((e.nativeEvent.locationX / barW) * status.duration)} style={s.track}>
                  <View style={s.trackBg} />
                  <View style={[s.fill, { width: `${pct}%` }]} />
                  <View style={[s.knob, { left: `${pct}%` }]} />
                </Pressable>
                <View style={s.times}>
                  <Txt testID="audio-time" size={13}>{fmtTime(status.time)}</Txt>
                  <Txt testID="audio-duration" size={13}>{fmtTime(status.duration)}</Txt>
                </View>
              </>
            ) : null}
            <Txt size={11} color={colors.muted} numberOfLines={1}>♪ {t("demoAudio")} · <Txt size={11} color={colors.muted} style={{ fontFamily: track.lang === "te" ? "NotoTelugu" : "Crimson" }}>{track.lang === "te" ? "తెలుగు" : "English"}</Txt></Txt>
          </View>
          <View style={{ gap: 6, alignItems: "center" }}>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Pressable testID="audio-prev-verse" onPress={() => stepVerse(-1)} style={s.mini}><Icon name="skip-previous" size={20} color={colors.maroon} /></Pressable>
              <Pressable testID="audio-next-verse" onPress={() => stepVerse(1)} style={s.mini}><Icon name="skip-next" size={20} color={colors.maroon} /></Pressable>
            </View>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Pressable testID="audio-speed" onPress={() => { const sp = SPEEDS[(SPEEDS.indexOf(prefs.speed) + 1) % SPEEDS.length]; setPrefs({ speed: sp }); playerRef.current?.setPlaybackRate(sp); }} style={s.speed}>
                <Txt v="bold" size={13} color={colors.maroon}>{prefs.speed}x</Txt>
              </Pressable>
              <Pressable testID="audio-volume" onPress={() => { const vo = VOLUMES[(VOLUMES.indexOf(prefs.volume) + 1) % VOLUMES.length]; setPrefs({ volume: vo }); if (playerRef.current) playerRef.current.volume = vo; toast(`${t("volume")} ${Math.round(vo * 100)}%`); }} style={s.mini}>
                <Icon name={prefs.volume === 0 ? "volume-off" : prefs.volume < 0.5 ? "volume-low" : prefs.volume < 1 ? "volume-medium" : "volume-high"} size={20} color={colors.maroon} />
              </Pressable>
            </View>
          </View>
        </View>
      ) : <View style={{ height: insets.bottom }} />}

      <Sheet testID="chapter-sheet" visible={sheet === "chapters"} onClose={() => setSheet(null)} title={t("chapters")}>
        {book.chapters.map((c) => (
          <Pressable key={c.id} testID={`chapter-option-${c.number}`} onPress={() => { setSheet(null); goCh(book.chapters.indexOf(c) - chIdx); }} style={[s.opt, c.number === chNum && s.optActive]}>
            <Txt v="bold" size={15} color={colors.maroon} style={{ width: 34 }}>{c.number}</Txt>
            <Txt size={15} style={{ flex: 1 }} numberOfLines={2}>{L(c.title, prefs.readLang)}</Txt>
            {c.verses.length ? <Icon name="book-open-variant" size={18} color={colors.gold} /> : null}
          </Pressable>
        ))}
      </Sheet>
      <Sheet testID="verse-sheet" visible={sheet === "verses"} onClose={() => setSheet(null)} title={t("verses")}>
        <View style={s.grid}>
          {verses.map((v) => (
            <Pressable key={v.id} testID={`verse-option-${v.ref}`} onPress={() => { setSheet(null); setSelected(v.n); if (track && status.playing) seekVerse(v.n); setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, (positions.current[v.n] ?? 0) - 40), animated: true }), 250); }} style={[s.vOpt, v.n === highlight && s.optActive]}>
              <Txt v="bold" size={15} color={colors.maroon}>{v.ref}</Txt>
            </Pressable>
          ))}
        </View>
      </Sheet>
      <ReaderSettingsSheet visible={sheet === "settings"} onClose={() => setSheet(null)} />
      <Sheet testID="verse-actions-sheet" visible={sheet === "actions"} onClose={() => setSheet(null)} title={actionVerse ? `${t("verse")} ${actionVerse.ref}` : t("verseActions")}>
        {actionVerse ? (
          <View style={{ gap: spacing.sm }}>
            {[
              { id: "bookmark", icon: isBm(actionVerse) ? "bookmark-remove-outline" : "bookmark-plus-outline", label: isBm(actionVerse) ? t("removeBookmark") : t("addBookmark"), fn: () => { const was = isBm(actionVerse); app.toggleBookmark({ type: "verse", bookId: book.id, chapterId: actionVerse.chapterId, verseId: actionVerse.id }); toast(was ? t("bookmarkRemoved") : t("bookmarkAdded")); setSheet(null); } },
              { id: "note", icon: "note-edit-outline", label: notes.some((n) => n.id === actionVerse.id) ? t("editNote") : t("addNote"), fn: () => { setNoteText(notes.find((n) => n.id === actionVerse.id)?.text ?? ""); setSheet("note"); } },
              { id: "copy", icon: "content-copy", label: t("copy"), fn: async () => { await Clipboard.setStringAsync(shareText(actionVerse)); toast(t("copied")); setSheet(null); } },
              { id: "share", icon: "share-variant-outline", label: t("share"), fn: () => { setSheet(null); Share.share({ message: shareText(actionVerse) }); } },
              ...(track ? [{ id: "play", icon: "play-circle-outline", label: t("playFromHere"), fn: () => { setSheet(null); setSelected(actionVerse.n); seekVerse(actionVerse.n); } }] : []),
              { id: "detail", icon: "text-box-outline", label: t("readFull"), fn: () => { setSheet(null); router.push(`/verse/${actionVerse.id}`); } },
            ].map((a) => (
              <Pressable key={a.id} testID={`verse-action-${a.id}`} onPress={a.fn} style={s.opt}>
                <Icon name={a.icon as any} size={22} color={colors.maroon} />
                <Txt v="semi" size={16} color={colors.maroon}>{a.label}</Txt>
              </Pressable>
            ))}
          </View>
        ) : null}
      </Sheet>
      <Sheet testID="note-sheet" visible={sheet === "note"} onClose={() => setSheet(null)} title={t("addNote")}>
        <TextInput testID="note-input" value={noteText} onChangeText={setNoteText} placeholder={t("notePlaceholder")} placeholderTextColor={colors.muted} multiline style={s.input} />
        <GoldButton testID="note-save-button" label={t("save")} icon="content-save-outline" onPress={() => { if (actionVerse) app.saveNote(actionVerse.id, noteText); toast(t("saved")); setSheet(null); }} />
      </Sheet>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1 },
  controls: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: spacing.md, paddingTop: 28, paddingBottom: spacing.sm },
  round: { width: 42, height: 42, borderRadius: 21, backgroundColor: c.ivory, borderWidth: 1, borderColor: c.cardBorder, alignItems: "center", justifyContent: "center", elevation: 2, shadowColor: c.shadow, shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  select: { flex: 1, height: 44, borderRadius: radius.lg, backgroundColor: c.ivory, borderWidth: 1, borderColor: c.cardBorder, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 8, elevation: 2, shadowColor: c.shadow, shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  content: { paddingLeft: spacing.md, paddingRight: 62, paddingBottom: spacing.xl },
  headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, marginVertical: spacing.md },
  heading: { textAlign: "center", flexShrink: 1 },
  verse: { flexDirection: "row", gap: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: "transparent", marginBottom: spacing.xs },
  numCol: { width: 52, alignItems: "flex-start", gap: 4 },
  bar: { width: 3, borderRadius: 2 },
  source: { marginTop: spacing.lg, fontStyle: "italic" },
  lotus: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: c.gold },
  fabs: { position: "absolute", right: 8, top: 8, gap: spacing.sm },
  fab: { width: 46, height: 46, borderRadius: 23, backgroundColor: c.ivory, borderWidth: 1, borderColor: c.cardBorder, alignItems: "center", justifyContent: "center", elevation: 3, shadowColor: c.shadow, shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  player: { marginHorizontal: spacing.md, backgroundColor: c.ivory, borderRadius: radius.lg, borderWidth: 1.5, borderColor: c.cardBorder, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md, elevation: 4, shadowColor: c.shadow, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
  playBtn: { width: 58, height: 58, borderRadius: 29, backgroundColor: c.maroon, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: c.gold },
  track: { height: 18, justifyContent: "center" },
  trackBg: { position: "absolute", left: 0, right: 0, height: 6, borderRadius: 3, backgroundColor: c.divider },
  fill: { position: "absolute", left: 0, height: 6, borderRadius: 3, backgroundColor: c.gold },
  knob: { position: "absolute", width: 14, height: 14, borderRadius: 7, marginLeft: -7, backgroundColor: c.goldLight, borderWidth: 2, borderColor: c.gold },
  times: { flexDirection: "row", justifyContent: "space-between" },
  mini: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: c.cardBorder, alignItems: "center", justifyContent: "center", backgroundColor: c.parchment },
  speed: { height: 44, minWidth: 44, paddingHorizontal: 6, borderRadius: 18, borderWidth: 1, borderColor: c.gold, alignItems: "center", justifyContent: "center", backgroundColor: c.parchment },
  opt: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: c.divider, marginBottom: spacing.sm, minHeight: 50 },
  optActive: { backgroundColor: c.highlight, borderColor: c.gold },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  vOpt: { width: 72, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: c.divider, alignItems: "center", justifyContent: "center" },
  input: { minHeight: 120, borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.md, padding: spacing.md, fontSize: 16, color: c.onSurface, backgroundColor: c.parchment, textAlignVertical: "top", marginBottom: spacing.md, fontFamily: "Crimson" },
}));
