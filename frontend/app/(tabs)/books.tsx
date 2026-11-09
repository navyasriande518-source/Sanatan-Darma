import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View, useWindowDimensions } from "react-native";

import { BookTile } from "@/src/components/BookCards";
import { Screen } from "@/src/components/Screen";
import { Sheet } from "@/src/components/Sheet";
import { Chip, EmptyState, Icon, Txt } from "@/src/components/ui";
import { BOOKS, CATEGORIES } from "@/src/data/content";
import { LANGUAGES } from "@/src/i18n";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

type Sort = "az" | "popular" | "new";

export default function Books() {
  const params = useLocalSearchParams<{ cat?: string; sort?: Sort; focus?: string }>();
  const { t, L } = useApp();
  const s = useStyles();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(params.cat ?? "all");
  const [sort, setSort] = useState<Sort>(params.sort ?? "az");
  const [lang, setLang] = useState<string>("any");
  const [filters, setFilters] = useState(false);

  useEffect(() => { setCat(params.cat ?? "all"); setSort(params.sort ?? "az"); }, [params.cat, params.sort]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let r = BOOKS.filter((b) => (cat === "all" || b.categoryId === cat) && (lang === "any" || b.languages.includes(lang)));
    if (needle) {
      r = r.filter((b) => {
        const catName = CATEGORIES.find((c) => c.id === b.categoryId)?.name;
        const langNames = b.languages.map((l) => LANGUAGES.find((x) => x.code === l)?.name ?? l).join(" ");
        const hay = [b.title.en, b.title.te, b.attribution.en, b.attribution.te, catName?.en, catName?.te, b.description.en, langNames, b.sections.en]
          .join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return hay.includes(needle.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      });
    }
    return [...r].sort((a, b) => (sort === "popular" ? b.popular - a.popular : sort === "new" ? b.addedOrder - a.addedOrder : a.title.en.localeCompare(b.title.en)));
  }, [q, cat, sort, lang]);

  const tileW = (Math.min(width, 700) - spacing.lg * 2 - spacing.sm * 2) / 3;

  const sticky = (
    <View>
      <View style={s.searchRow}>
        <View style={s.search}>
          <Icon name="magnify" size={22} color={colors.maroon} />
          <TextInput testID="books-search-input" value={q} onChangeText={setQ} placeholder={t("searchBooks")} placeholderTextColor={colors.muted} style={s.input} returnKeyType="search" />
          {q ? <Pressable testID="books-search-clear" onPress={() => setQ("")} hitSlop={8}><Icon name="close-circle" size={18} color={colors.muted} /></Pressable> : null}
        </View>
        <Pressable testID="books-filter-button" onPress={() => setFilters(true)} style={s.filterBtn}>
          <Icon name="filter-variant" size={24} color={colors.maroon} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsRow} contentContainerStyle={s.chips}>
        <Chip testID="books-cat-all" label={t("allBooks")} active={cat === "all"} onPress={() => setCat("all")} />
        {CATEGORIES.map((c) => <Chip key={c.id} testID={`books-cat-${c.id}`} label={L(c.name)} icon={c.icon} active={cat === c.id} onPress={() => setCat(c.id)} />)}
      </ScrollView>
    </View>
  );

  return (
    <Screen testID="books-screen" title={t("books")} icon="book-open-page-variant" sticky={sticky} tab>
      <Txt testID="books-count" size={13} color={colors.muted} style={{ marginBottom: spacing.sm }}>{list.length} {t("books").toLowerCase()}</Txt>
      {list.length ? (
        <View style={s.grid}>
          {list.map((b) => <BookTile key={b.id} book={b} width={tileW} />)}
        </View>
      ) : <EmptyState testID="books-empty" icon="bookshelf" text={t("noResults")} />}

      <Sheet testID="books-filter-sheet" visible={filters} onClose={() => setFilters(false)} title={t("filter")}>
        <Txt v="bold" size={15} color={colors.maroon} style={s.fl}>{t("languages")}</Txt>
        <View style={s.wrapRow}>
          {[{ code: "any", native: t("any") }, { code: "sa", native: "संस्कृतम्" }, { code: "te", native: "తెలుగు" }, { code: "en", native: "English" }].map((l) => (
            <Chip key={l.code} testID={`books-lang-${l.code}`} label={l.native} active={lang === l.code} onPress={() => setLang(l.code)} />
          ))}
        </View>
        <Txt v="bold" size={15} color={colors.maroon} style={s.fl}>Sort</Txt>
        <View style={s.wrapRow}>
          <Chip testID="books-sort-az" label="A–Z" active={sort === "az"} onPress={() => setSort("az")} />
          <Chip testID="books-sort-popular" label={t("trending")} active={sort === "popular"} onPress={() => setSort("popular")} />
          <Chip testID="books-sort-new" label={t("recentlyAdded")} active={sort === "new"} onPress={() => setSort("new")} />
        </View>
      </Sheet>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  searchRow: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, alignItems: "center" },
  search: { flex: 1, height: 48, flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: c.ivory, borderRadius: radius.pill, borderWidth: 1, borderColor: c.cardBorder, paddingHorizontal: spacing.md },
  input: { flex: 1, fontSize: 16, color: c.onSurface, fontFamily: "Crimson", height: 46 },
  filterBtn: { width: 48, height: 48, borderRadius: radius.lg, backgroundColor: c.ivory, borderWidth: 1, borderColor: c.cardBorder, alignItems: "center", justifyContent: "center" },
  chipsRow: { height: 56, flexGrow: 0 },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg, alignItems: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  fl: { marginTop: spacing.md, marginBottom: spacing.sm },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
}));
