import { useLocalSearchParams } from "expo-router";
import React from "react";

import { Screen } from "@/src/components/Screen";
import { Card, Txt } from "@/src/components/ui";
import { TKey } from "@/src/i18n";
import { useApp } from "@/src/store/AppContext";
import { spacing, useTheme } from "@/src/theme";

type Page = { title: TKey; en: [string, string][]; te: [string, string][] };
const PAGES: Record<string, Page> = {
  about: { title: "aboutApp", en: [
    ["Sanatana Dharma – Digital Library", "Version 1.0.0 (Phase 1 demonstration). A multilingual library of Hindu scriptures with reading, audio, bookmarks and notes — all stored on your device."],
    ["Content", "Demo editions contain verified sample excerpts only. Books marked 'Catalogue entry' list their structure without text. Sanskrit texts are from traditional public-domain recensions; English renderings by R.T.H. Griffith are public domain; other meanings are prototype renderings pending scholarly review."],
    ["Audio", "Narration for Bhagavad Gita Chapter 7 is AI-generated demo audio bundled with the app, synchronised verse-by-verse with timestamp metadata."],
  ], te: [
    ["సనాతన ధర్మం – డిజిటల్ గ్రంథాలయం", "వెర్షన్ 1.0.0 (మొదటి దశ డెమో). పఠనం, ఆడియో, బుక్‌మార్క్స్, గమనికలతో బహుభాషా హిందూ గ్రంథాలయం — అంతా మీ పరికరంలోనే."],
    ["కంటెంట్", "డెమో సంచికలలో ధృవీకరించిన నమూనా భాగాలు మాత్రమే ఉన్నాయి. 'సూచిక నమోదు' పుస్తకాలలో పాఠ్యం లేదు. అర్థాలు పండితుల సమీక్ష కోసం వేచి ఉన్న నమూనా అనువాదాలు."],
    ["ఆడియో", "భగవద్గీత 7వ అధ్యాయ పఠనం AI ద్వారా తయారైన డెమో ఆడియో, శ్లోకాల వారీగా సమకాలీకరించబడింది."],
  ] },
  help: { title: "help", en: [
    ["Reading", "Open Books → choose a scripture → Start Reading. Use the chapter and verse selectors at the top. Long-press a verse to bookmark, add a note, copy or share."],
    ["Audio", "Tap play in the reader. The playing verse is highlighted in gold. Tap any verse to jump to it."],
    ["Contact", "This is a demo build. Support channels will be added in a future phase."],
  ], te: [
    ["పఠనం", "పుస్తకాలు → గ్రంథం ఎంచుకోండి → చదవడం ప్రారంభించండి. శ్లోకాన్ని నొక్కి పట్టి బుక్‌మార్క్, గమనిక, కాపీ, షేర్ చేయండి."],
    ["ఆడియో", "రీడర్‌లో ప్లే నొక్కండి. ప్లే అవుతున్న శ్లోకం బంగారు రంగులో హైలైట్ అవుతుంది. ఏ శ్లోకాన్నైనా నొక్కి అక్కడికి వెళ్లండి."],
    ["సంప్రదింపు", "ఇది డెమో బిల్డ్. మద్దతు మార్గాలు భవిష్యత్తులో చేర్చబడతాయి."],
  ] },
  faq: { title: "faq", en: [
    ["Does the app need internet?", "No. All books, audio, fonts and your data are stored on the device."],
    ["Can I read Telugu and listen in English?", "Yes. Interface, reading and audio languages are set separately in Language settings."],
    ["Are the donations real?", "No. Dāna is a demonstration module; no payment is collected."],
    ["Are complete scriptures included?", "Not yet. Demo excerpts are clearly labelled; full editions can be imported later."],
  ], te: [
    ["యాప్‌కు ఇంటర్నెట్ అవసరమా?", "అవసరం లేదు. పుస్తకాలు, ఆడియో, ఫాంట్లు, మీ డేటా అన్నీ పరికరంలోనే."],
    ["తెలుగులో చదివి ఇంగ్లీషులో వినవచ్చా?", "అవును. ఇంటర్‌ఫేస్, పఠనం, ఆడియో భాషలు వేర్వేరుగా ఎంచుకోవచ్చు."],
    ["విరాళాలు నిజమైనవా?", "కాదు. దానం డెమో విభాగం మాత్రమే; చెల్లింపు జరగదు."],
    ["పూర్తి గ్రంథాలు ఉన్నాయా?", "ఇంకా లేవు. నమూనా భాగాలు స్పష్టంగా గుర్తించబడ్డాయి."],
  ] },
  privacy: { title: "privacy", en: [["Your data stays on your device", "Profile, bookmarks, notes, reading history and preferences are stored only in the local database on this device. Nothing is sent to any server in this demo."]], te: [["మీ డేటా మీ పరికరంలోనే", "ప్రొఫైల్, బుక్‌మార్క్స్, గమనికలు, పఠన చరిత్ర అన్నీ ఈ పరికరంలోని స్థానిక డేటాబేస్‌లోనే ఉంటాయి. ఏ సర్వర్‌కూ పంపబడవు."]] },
  terms: { title: "terms", en: [["Demonstration use", "This prototype is provided for demonstration. Scripture excerpts are for study; translations marked as prototype renderings should not be cited as authoritative."]], te: [["డెమో వినియోగం", "ఈ నమూనా డెమో కోసం మాత్రమే. నమూనా అనువాదాలను ప్రామాణికంగా ఉటంకించరాదు."]] },
};

export default function Info() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const { t, prefs } = useApp();
  const { colors } = useTheme();
  const p = PAGES[page] ?? PAGES.about;
  return (
    <Screen testID={`info-${page}-screen`} back title={t(p.title)} icon="information-outline">
      {(prefs.uiLang === "te" ? p.te : p.en).map(([h, b]) => (
        <Card key={h} style={{ marginBottom: spacing.md }}>
          <Txt v="heading" size={18} color={colors.maroon} style={{ marginBottom: 4 }}>{h}</Txt>
          <Txt size={15}>{b}</Txt>
        </Card>
      ))}
    </Screen>
  );
}
