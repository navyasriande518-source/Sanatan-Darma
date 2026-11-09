// Seed content for the demo library. This module is the single source of the
// seed data: on native it is also written into SQLite (see src/db) with
// INSERT OR IGNORE so repeated initialisation never duplicates records.
// To add a full edition later: add chapters/verses in the same shape.
import gita7 from "./gita7.json";
import timings from "./audioTimings.json";

export type L = { en: string; te?: string };
export type Verse = {
  id: string; bookId: string; chapterId: string; n: number; ref: string;
  speaker?: string; sa: string; iast?: string; en: string; te?: string; noteEn?: string;
};
export type Chapter = { id: string; bookId: string; number: number; title: L; description?: L; verseCount?: number; verses: Verse[] };
export type Book = {
  id: string; title: L; categoryId: string; cover: any; attribution: L; languages: string[];
  sections: L; description: L; about: L; edition: "demo" | "catalogue"; source: string;
  chapterLabel: L; chapters: Chapter[]; addedOrder: number; popular: number;
};
export type AudioTrack = { id: string; bookId: string; chapterId: string; lang: "te" | "en"; file: any; duration: number; bytes: number; segments: { verse: number; start: number; end: number }[] };

export const CATEGORIES: { id: string; name: L; icon: string }[] = [
  { id: "vedas", name: { en: "Vedas", te: "వేదాలు" }, icon: "fire" },
  { id: "upanishads", name: { en: "Upanishads", te: "ఉపనిషత్తులు" }, icon: "spa-outline" },
  { id: "itihasas", name: { en: "Itihasas", te: "ఇతిహాసాలు" }, icon: "bow-arrow" },
  { id: "puranas", name: { en: "Puranas", te: "పురాణాలు" }, icon: "flower-outline" },
  { id: "gita", name: { en: "Bhagavad Gita", te: "భగవద్గీత" }, icon: "book-open-page-variant-outline" },
  { id: "darshanas", name: { en: "Darshanas", te: "దర్శనాలు" }, icon: "eye-outline" },
  { id: "dharma", name: { en: "Dharma Shastras", te: "ధర్మశాస్త్రాలు" }, icon: "scale-balance" },
  { id: "yoga", name: { en: "Yoga & Philosophy", te: "యోగ & తత్వం" }, icon: "meditation" },
  { id: "stotras", name: { en: "Stotras & Prayers", te: "స్తోత్రాలు & ప్రార్థనలు" }, icon: "hands-pray" },
  { id: "other", name: { en: "Other Scriptures", te: "ఇతర గ్రంథాలు" }, icon: "bookshelf" },
];

const art = {
  gita: require("../../assets/images/art/cover_gita.jpg"),
  ramayana: require("../../assets/images/art/cover_ramayana.jpg"),
  mahabharata: require("../../assets/images/art/cover_mahabharata.jpg"),
  upanishads: require("../../assets/images/art/cover_upanishads.jpg"),
  vedas: require("../../assets/images/art/cover_vedas.jpg"),
  puranas: require("../../assets/images/art/cover_puranas.jpg"),
  brahma: require("../../assets/images/art/cover_brahmasutras.jpg"),
  yoga: require("../../assets/images/art/cover_yogasutras.jpg"),
  dharma: require("../../assets/images/art/cover_dharmashastra.jpg"),
};

type RawV = Omit<Verse, "id" | "bookId" | "chapterId">;
type RawC = { number: number; title: L; description?: L; verseCount?: number; verses?: RawV[] };

function mkChapters(bookId: string, raw: RawC[]): Chapter[] {
  return raw.map((c) => {
    const chapterId = `${bookId}-c${c.number}`;
    return {
      id: chapterId, bookId, number: c.number, title: c.title, description: c.description, verseCount: c.verseCount,
      verses: (c.verses ?? []).map((v) => ({ ...v, id: `${chapterId}-v${v.n}`, bookId, chapterId })),
    };
  });
}
const names = (list: [string, string][]): RawC[] => list.map(([en, te], i) => ({ number: i + 1, title: { en, te } }));

// ---------- Bhagavad Gita ----------
const GITA_CH: [string, string, number, string, string][] = [
  ["Arjuna Viṣāda Yoga – The Yoga of Arjuna's Dejection", "అర్జున విషాద యోగము", 47, "Arjuna, seeing his kinsmen arrayed for battle, is overcome by grief.", "యుద్ధభూమిలో బంధువులను చూసి అర్జునుడు శోకంలో మునిగిపోతాడు."],
  ["Sāṅkhya Yoga – The Yoga of Knowledge", "సాంఖ్య యోగము", 72, "Krishna teaches the immortality of the Self and steady wisdom.", "ఆత్మ యొక్క నిత్యత్వం మరియు స్థితప్రజ్ఞ లక్షణాలు."],
  ["Karma Yoga – The Yoga of Action", "కర్మ యోగము", 43, "Selfless action performed as duty, without attachment.", "ఫలాపేక్ష లేని కర్తవ్య కర్మ."],
  ["Jñāna Karma Sannyāsa Yoga", "జ్ఞాన కర్మ సన్న్యాస యోగము", 42, "Divine incarnation and knowledge that purifies action.", "అవతార తత్వం మరియు కర్మను పవిత్రం చేసే జ్ఞానం."],
  ["Karma Sannyāsa Yoga – The Yoga of Renunciation", "కర్మ సన్న్యాస యోగము", 29, "Renunciation and action in harmony.", "సన్న్యాసం మరియు కర్మయోగాల సమన్వయం."],
  ["Dhyāna Yoga – The Yoga of Meditation", "ఆత్మ సంయమ యోగము", 47, "The practice and goal of meditation.", "ధ్యాన సాధన మరియు దాని లక్ష్యం."],
  ["Jñāna Vijñāna Yoga – The Yoga of Knowledge and Realization", "జ్ఞాన విజ్ఞాన యోగము", 30, "Krishna reveals His higher and lower natures.", "శ్రీకృష్ణుడు తన పర, అపర ప్రకృతులను వివరిస్తాడు."],
  ["Akṣara Brahma Yoga", "అక్షర బ్రహ్మ యోగము", 28, "The imperishable Brahman and the path at the time of departure.", "అక్షర బ్రహ్మం మరియు అంతిమ కాల మార్గం."],
  ["Rāja Vidyā Rāja Guhya Yoga", "రాజవిద్యా రాజగుహ్య యోగము", 34, "The sovereign knowledge and sovereign secret.", "రాజవిద్య మరియు రాజగుహ్యం."],
  ["Vibhūti Yoga – The Divine Glories", "విభూతి యోగము", 42, "Krishna describes His divine manifestations.", "శ్రీకృష్ణుని దివ్య విభూతులు."],
  ["Viśvarūpa Darśana Yoga", "విశ్వరూప సందర్శన యోగము", 55, "Arjuna beholds the Cosmic Form.", "అర్జునుడు విశ్వరూపాన్ని దర్శిస్తాడు."],
  ["Bhakti Yoga – The Yoga of Devotion", "భక్తి యోగము", 20, "The path of devotion and the qualities of a devotee.", "భక్తి మార్గం మరియు భక్తుని లక్షణాలు."],
  ["Kṣetra Kṣetrajña Vibhāga Yoga", "క్షేత్ర క్షేత్రజ్ఞ విభాగ యోగము", 34, "The field and the knower of the field.", "క్షేత్రం మరియు క్షేత్రజ్ఞుడు."],
  ["Guṇatraya Vibhāga Yoga", "గుణత్రయ విభాగ యోగము", 27, "The three gunas of nature.", "ప్రకృతి యొక్క త్రిగుణాలు."],
  ["Puruṣottama Yoga", "పురుషోత్తమ ప్రాప్తి యోగము", 20, "The Supreme Person.", "పురుషోత్తముని తత్వం."],
  ["Daivāsura Sampad Vibhāga Yoga", "దైవాసుర సంపద్విభాగ యోగము", 24, "Divine and demonic qualities.", "దైవ, ఆసుర సంపదలు."],
  ["Śraddhātraya Vibhāga Yoga", "శ్రద్ధాత్రయ విభాగ యోగము", 28, "The three kinds of faith.", "మూడు రకాల శ్రద్ధ."],
  ["Mokṣa Sannyāsa Yoga", "మోక్ష సన్న్యాస యోగము", 78, "Liberation through renunciation; the final teaching.", "సన్న్యాసం ద్వారా మోక్షం; ముగింపు ఉపదేశం."],
];

const gitaChapters: RawC[] = GITA_CH.map(([en, te, count, dEn, dTe], i) => ({
  number: i + 1, title: { en, te }, description: { en: dEn, te: dTe }, verseCount: count,
  verses: i === 6 ? (gita7.verses as any[]).map((v) => ({ ...v, ref: `7.${v.n}` })) : undefined,
}));

function book(b: Omit<Book, "chapters">, raw: RawC[]): Book {
  return { ...b, chapters: mkChapters(b.id, raw) };
}

const PD = "Sanskrit text: traditional public-domain recension.";

export const BOOKS: Book[] = [
  book({
    id: "bhagavad-gita", title: { en: "Śrīmad Bhagavad Gītā", te: "శ్రీమద్భగవద్గీత" }, categoryId: "gita", cover: art.gita,
    attribution: { en: "Traditionally attributed to Sage Vyāsa (Bhīṣma Parva of the Mahābhārata)", te: "సాంప్రదాయికంగా వ్యాస మహర్షి (మహాభారతం, భీష్మ పర్వం)" },
    languages: ["sa", "te", "en"], sections: { en: "18 Chapters", te: "18 అధ్యాయాలు" }, chapterLabel: { en: "Chapter", te: "అధ్యాయం" },
    description: { en: "The dialogue between Śrī Krishna and Arjuna on the battlefield of Kurukṣetra — 700 verses on duty, knowledge and devotion.", te: "కురుక్షేత్ర రణభూమిలో శ్రీకృష్ణార్జునుల సంవాదం — కర్తవ్యం, జ్ఞానం, భక్తిపై 700 శ్లోకాలు." },
    about: { en: "Demo edition: all 18 chapter entries with descriptions; Chapter 7 includes verses 7.1–7.8 with Sanskrit, Telugu-script and IAST transliteration, English and Telugu meaning, plus demo narration.", te: "డెమో సంచిక: 18 అధ్యాయాల వివరాలు; 7వ అధ్యాయంలో 7.1–7.8 శ్లోకాలు సంస్కృతం, తెలుగు లిపి, అర్థాలు మరియు డెమో ఆడియోతో." },
    edition: "demo", source: `${PD} English and Telugu meanings are prototype renderings prepared for this demo and pending scholarly review.`, addedOrder: 3, popular: 100,
  }, gitaChapters),
  book({
    id: "ramayana", title: { en: "Vālmīki Rāmāyaṇa", te: "వాల్మీకి రామాయణం" }, categoryId: "itihasas", cover: art.ramayana,
    attribution: { en: "Sage Vālmīki (Ādi Kavi)", te: "వాల్మీకి మహర్షి (ఆదికవి)" }, languages: ["sa", "te", "en"],
    sections: { en: "7 Kāṇḍas", te: "7 కాండలు" }, chapterLabel: { en: "Kāṇḍa", te: "కాండ" },
    description: { en: "The first epic poem (Ādi Kāvya) narrating the life of Śrī Rāma.", te: "శ్రీరాముని జీవితాన్ని వర్ణించే ఆదికావ్యం." },
    about: { en: "Demo edition: the seven Kāṇḍas with the opening verses of Bāla Kāṇḍa, Sarga 1.", te: "డెమో సంచిక: ఏడు కాండలు, బాలకాండ మొదటి సర్గ ప్రారంభ శ్లోకాలు." },
    edition: "demo", source: `${PD} Meanings are prototype renderings for this demo.`, addedOrder: 5, popular: 90,
  }, [
    { number: 1, title: { en: "Bāla Kāṇḍa", te: "బాలకాండ" }, description: { en: "Sarga 1 – opening verses", te: "సర్గ 1 – ప్రారంభ శ్లోకాలు" }, verses: [
      { n: 1, ref: "1.1.1", sa: "तपःस्वाध्यायनिरतं तपस्वी वाग्विदां वरम् ।\nनारदं परिपप्रच्छ वाल्मीकिर्मुनिपुङ्गवम् ॥", iast: "tapaḥ-svādhyāya-nirataṃ tapasvī vāgvidāṃ varam |\nnāradaṃ paripapraccha vālmīkir muni-puṅgavam ||", en: "The ascetic Vālmīki questioned Nārada — foremost among sages, devoted to austerity and sacred study, and best among the eloquent.", te: "తపస్సు, స్వాధ్యాయంలో నిమగ్నుడు, వాక్కుశలులలో శ్రేష్ఠుడు అయిన నారద మునిని తపస్వి వాల్మీకి ప్రశ్నించెను." },
      { n: 2, ref: "1.1.2", sa: "को न्वस्मिन्साम्प्रतं लोके गुणवान्कश्च वीर्यवान् ।\nधर्मज्ञश्च कृतज्ञश्च सत्यवाक्यो दृढव्रतः ॥", iast: "ko nv asmin sāmprataṃ loke guṇavān kaś ca vīryavān |\ndharmajñaś ca kṛtajñaś ca satya-vākyo dṛḍha-vrataḥ ||", en: "Who in this world at present is virtuous and valiant, a knower of dharma, grateful, truthful in speech and firm in his vows?", te: "ప్రస్తుతం ఈ లోకంలో గుణవంతుడు, వీర్యవంతుడు, ధర్మజ్ఞుడు, కృతజ్ఞుడు, సత్యవాక్యుడు, దృఢవ్రతుడు ఎవరు?" },
    ] },
    ...names([["Ayodhyā Kāṇḍa", "అయోధ్యాకాండ"], ["Araṇya Kāṇḍa", "అరణ్యకాండ"], ["Kiṣkindhā Kāṇḍa", "కిష్కింధాకాండ"], ["Sundara Kāṇḍa", "సుందరకాండ"], ["Yuddha Kāṇḍa", "యుద్ధకాండ"], ["Uttara Kāṇḍa", "ఉత్తరకాండ"]]).map((c) => ({ ...c, number: c.number + 1 })),
  ]),
  book({
    id: "mahabharata", title: { en: "Mahābhārata", te: "మహాభారతం" }, categoryId: "itihasas", cover: art.mahabharata,
    attribution: { en: "Sage Vyāsa", te: "వ్యాస మహర్షి" }, languages: ["sa", "te", "en"], sections: { en: "18 Parvas", te: "18 పర్వాలు" }, chapterLabel: { en: "Parva", te: "పర్వం" },
    description: { en: "The great epic of the Bhārata dynasty, containing the Bhagavad Gītā.", te: "భరత వంశ మహేతిహాసం, భగవద్గీతను కలిగి ఉన్నది." },
    about: { en: "Catalogue entry: the 18 Parvas are listed. Text is not yet included in this demo.", te: "సూచిక నమోదు: 18 పర్వాల జాబితా. పాఠ్యం ఇంకా చేర్చలేదు." },
    edition: "catalogue", source: "—", addedOrder: 6, popular: 80,
  }, names([["Ādi Parva", "ఆది పర్వం"], ["Sabhā Parva", "సభా పర్వం"], ["Vana Parva", "అరణ్య పర్వం"], ["Virāṭa Parva", "విరాట పర్వం"], ["Udyoga Parva", "ఉద్యోగ పర్వం"], ["Bhīṣma Parva", "భీష్మ పర్వం"], ["Droṇa Parva", "ద్రోణ పర్వం"], ["Karṇa Parva", "కర్ణ పర్వం"], ["Śalya Parva", "శల్య పర్వం"], ["Sauptika Parva", "సౌప్తిక పర్వం"], ["Strī Parva", "స్త్రీ పర్వం"], ["Śānti Parva", "శాంతి పర్వం"], ["Anuśāsana Parva", "అనుశాసనిక పర్వం"], ["Aśvamedhika Parva", "అశ్వమేధ పర్వం"], ["Āśramavāsika Parva", "ఆశ్రమవాస పర్వం"], ["Mausala Parva", "మౌసల పర్వం"], ["Mahāprasthānika Parva", "మహాప్రస్థానిక పర్వం"], ["Svargārohaṇa Parva", "స్వర్గారోహణ పర్వం"]])),
  book({
    id: "rig-veda", title: { en: "Ṛg Veda", te: "ఋగ్వేదం" }, categoryId: "vedas", cover: art.vedas,
    attribution: { en: "Śruti – revealed to the ṛṣis", te: "శ్రుతి – ఋషులకు దర్శనమైనది" }, languages: ["sa", "te", "en"], sections: { en: "10 Maṇḍalas", te: "10 మండలాలు" }, chapterLabel: { en: "Maṇḍala", te: "మండలం" },
    description: { en: "The oldest of the four Vedas: hymns (sūktas) to the deities.", te: "నాలుగు వేదాలలో ప్రాచీనమైనది: దేవతా స్తుతి సూక్తాలు." },
    about: { en: "Demo edition: Maṇḍala list with two verified mantras (1.1.1 and the Gāyatrī, 3.62.10).", te: "డెమో సంచిక: మండలాల జాబితా మరియు రెండు మంత్రాలు (1.1.1, గాయత్రి 3.62.10)." },
    edition: "demo", source: `${PD} English: R.T.H. Griffith (1896, public domain).`, addedOrder: 1, popular: 70,
  }, Array.from({ length: 10 }, (_, i) => ({
    number: i + 1, title: { en: `Maṇḍala ${i + 1}`, te: `మండలం ${i + 1}` },
    verses: i === 0 ? [{ n: 1, ref: "1.1.1", sa: "अग्निमीळे पुरोहितं यज्ञस्य देवमृत्विजम् ।\nहोतारं रत्नधातमम् ॥", iast: "agnim īḷe purohitaṃ yajñasya devam ṛtvijam |\nhotāraṃ ratna-dhātamam ||", en: "I laud Agni, the chosen Priest, God, minister of sacrifice, the Hotar, lavishest of wealth. (Griffith)", te: "పురోహితుడు, యజ్ఞ దేవుడు, ఋత్విజుడు, హోత, రత్నాలను ప్రసాదించువాడు అయిన అగ్నిని స్తుతిస్తున్నాను." }]
      : i === 2 ? [{ n: 10, ref: "3.62.10", sa: "तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि ।\nधियो यो नः प्रचोदयात् ॥", iast: "tat savitur vareṇyaṃ bhargo devasya dhīmahi |\ndhiyo yo naḥ pracodayāt ||", en: "May we attain that excellent glory of Savitar the God: so may he stimulate our prayers. (Griffith)", te: "సవితృ దేవుని శ్రేష్ఠమైన తేజస్సును ధ్యానిస్తున్నాము; ఆయన మా బుద్ధులను ప్రేరేపించుగాక." }] : undefined,
  }))),
  book({
    id: "yajur-veda", title: { en: "Yajur Veda", te: "యజుర్వేదం" }, categoryId: "vedas", cover: art.vedas,
    attribution: { en: "Śruti", te: "శ్రుతి" }, languages: ["sa", "te", "en"], sections: { en: "Śukla & Kṛṣṇa", te: "శుక్ల & కృష్ణ" }, chapterLabel: { en: "Section", te: "భాగం" },
    description: { en: "The Veda of sacrificial formulas, in the Śukla (White) and Kṛṣṇa (Black) traditions.", te: "యజ్ఞ మంత్రాల వేదం – శుక్ల, కృష్ణ శాఖలు." },
    about: { en: "Demo edition: Vājasaneyi Saṃhitā 40.1 (also the first verse of the Īśa Upaniṣad).", te: "డెమో సంచిక: వాజసనేయి సంహిత 40.1 (ఈశావాస్యోపనిషత్ మొదటి మంత్రం)." },
    edition: "demo", source: `${PD} Meaning: prototype rendering.`, addedOrder: 2, popular: 50,
  }, [
    { number: 1, title: { en: "Śukla Yajurveda – Vājasaneyi Saṃhitā", te: "శుక్ల యజుర్వేదం – వాజసనేయి సంహిత" }, verses: [
      { n: 1, ref: "40.1", sa: "ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत् ।\nतेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम् ॥", iast: "īśā vāsyam idaṃ sarvaṃ yat kiñca jagatyāṃ jagat |\ntena tyaktena bhuñjīthā mā gṛdhaḥ kasya svid dhanam ||", en: "All this — whatever moves in this moving world — is pervaded by the Lord. Enjoy through renunciation; do not covet anyone's wealth.", te: "ఈ జగత్తులో కదిలేదంతా ఈశ్వరునిచే వ్యాపించి ఉంది. త్యాగభావంతో అనుభవించు; ఎవరి ధనాన్నీ ఆశించకు." },
    ] },
    { number: 2, title: { en: "Kṛṣṇa Yajurveda – Taittirīya Saṃhitā", te: "కృష్ణ యజుర్వేదం – తైత్తిరీయ సంహిత" } },
  ]),
  book({
    id: "sama-veda", title: { en: "Sāma Veda", te: "సామవేదం" }, categoryId: "vedas", cover: art.vedas,
    attribution: { en: "Śruti", te: "శ్రుతి" }, languages: ["sa", "te", "en"], sections: { en: "2 Ārcikas", te: "2 ఆర్చికాలు" }, chapterLabel: { en: "Section", te: "భాగం" },
    description: { en: "The Veda of melodies; chants drawn largely from the Ṛg Veda.", te: "గాన వేదం; ఎక్కువగా ఋగ్వేదం నుండి తీసుకున్న మంత్రాలు." },
    about: { en: "Demo edition: the opening mantra of the Pūrvārcika.", te: "డెమో సంచిక: పూర్వార్చిక మొదటి మంత్రం." },
    edition: "demo", source: `${PD} English: R.T.H. Griffith (1893, public domain).`, addedOrder: 4, popular: 40,
  }, [
    { number: 1, title: { en: "Pūrvārcika", te: "పూర్వార్చిక" }, verses: [
      { n: 1, ref: "1.1", sa: "अग्न आ याहि वीतये गृणानो हव्यदातये ।\nनि होता सत्सि बर्हिषि ॥", iast: "agna ā yāhi vītaye gṛṇāno havya-dātaye |\nni hotā satsi barhiṣi ||", en: "Come, Agni, praised with song, to feast and sacrificial offering: sit as Hotar on the holy grass. (Griffith)", te: "ఓ అగ్నీ! స్తుతింపబడుచు హవిస్సును స్వీకరించుటకు రమ్ము; హోతగా దర్భాసనంపై కూర్చుండుము." },
    ] },
    { number: 2, title: { en: "Uttarārcika", te: "ఉత్తరార్చిక" } },
  ]),
  book({
    id: "atharva-veda", title: { en: "Atharva Veda", te: "అథర్వవేదం" }, categoryId: "vedas", cover: art.vedas,
    attribution: { en: "Śruti – associated with ṛṣis Atharvan and Aṅgiras", te: "శ్రుతి – అథర్వ, అంగీరస ఋషులు" }, languages: ["sa", "te", "en"], sections: { en: "20 Kāṇḍas", te: "20 కాండలు" }, chapterLabel: { en: "Kāṇḍa", te: "కాండ" },
    description: { en: "Hymns for daily life, healing, and the famous Bhūmi Sūkta (hymn to the Earth).", te: "నిత్య జీవితం, ఆరోగ్యం, భూమి సూక్తం కలిగిన మంత్రాలు." },
    about: { en: "Demo edition: a line from the Bhūmi Sūkta (12.1.12).", te: "డెమో సంచిక: భూమి సూక్తం (12.1.12) నుండి ఒక పంక్తి." },
    edition: "demo", source: `${PD} Meaning: prototype rendering.`, addedOrder: 7, popular: 35,
  }, Array.from({ length: 20 }, (_, i) => ({
    number: i + 1, title: { en: `Kāṇḍa ${i + 1}`, te: `కాండ ${i + 1}` },
    verses: i === 11 ? [{ n: 12, ref: "12.1.12", sa: "माता भूमिः पुत्रो अहं पृथिव्याः ।", iast: "mātā bhūmiḥ putro ahaṃ pṛthivyāḥ |", en: "The Earth is my mother, and I am the son of the Earth.", te: "భూమి నా తల్లి, నేను భూమాత పుత్రుడను." }] : undefined,
  }))),
  book({
    id: "upanishads", title: { en: "Principal Upaniṣads", te: "ముఖ్య ఉపనిషత్తులు" }, categoryId: "upanishads", cover: art.upanishads,
    attribution: { en: "Śruti – Vedānta portion of the Vedas", te: "శ్రుతి – వేదాల వేదాంత భాగం" }, languages: ["sa", "te", "en"], sections: { en: "10 Principal", te: "10 ముఖ్యమైనవి" }, chapterLabel: { en: "Upaniṣad", te: "ఉపనిషత్" },
    description: { en: "The philosophical heart of the Vedas, exploring Brahman and Ātman.", te: "బ్రహ్మం, ఆత్మలను విచారించే వేదాల తాత్విక సారం." },
    about: { en: "Demo edition: ten principal Upaniṣads listed, with well-known verified passages from Īśa, Kaṭha, Muṇḍaka and Bṛhadāraṇyaka.", te: "డెమో సంచిక: పది ముఖ్య ఉపనిషత్తులు, ప్రసిద్ధ మంత్రాలతో." },
    edition: "demo", source: `${PD} Meanings: prototype renderings.`, addedOrder: 8, popular: 85,
  }, [
    { number: 1, title: { en: "Īśa Upaniṣad", te: "ఈశావాస్యోపనిషత్" }, verses: [
      { n: 1, ref: "Īśa 1", sa: "ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत् ।\nतेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम् ॥", iast: "īśā vāsyam idaṃ sarvaṃ yat kiñca jagatyāṃ jagat |\ntena tyaktena bhuñjīthā mā gṛdhaḥ kasya svid dhanam ||", en: "All this — whatever moves in this moving world — is pervaded by the Lord. Enjoy through renunciation; do not covet anyone's wealth.", te: "ఈ జగత్తులో కదిలేదంతా ఈశ్వరునిచే వ్యాపించి ఉంది. త్యాగభావంతో అనుభవించు; ఎవరి ధనాన్నీ ఆశించకు." },
    ] },
    { number: 2, title: { en: "Kena Upaniṣad", te: "కేనోపనిషత్" } },
    { number: 3, title: { en: "Kaṭha Upaniṣad", te: "కఠోపనిషత్" }, verses: [
      { n: 14, ref: "Kaṭha 1.3.14", sa: "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत ।", iast: "uttiṣṭhata jāgrata prāpya varān nibodhata |", en: "Arise! Awake! Approach the great teachers and learn.", te: "లేవండి! మేల్కొనండి! శ్రేష్ఠులైన గురువులను చేరి తెలుసుకోండి." },
    ] },
    { number: 4, title: { en: "Praśna Upaniṣad", te: "ప్రశ్నోపనిషత్" } },
    { number: 5, title: { en: "Muṇḍaka Upaniṣad", te: "ముండకోపనిషత్" }, verses: [
      { n: 6, ref: "Muṇḍaka 3.1.6", sa: "सत्यमेव जयते नानृतं ।", iast: "satyam eva jayate nānṛtam |", en: "Truth alone triumphs, not falsehood.", te: "సత్యమే జయిస్తుంది, అసత్యం కాదు." },
    ] },
    { number: 6, title: { en: "Māṇḍūkya Upaniṣad", te: "మాండూక్యోపనిషత్" } },
    { number: 7, title: { en: "Taittirīya Upaniṣad", te: "తైత్తిరీయోపనిషత్" } },
    { number: 8, title: { en: "Aitareya Upaniṣad", te: "ఐతరేయోపనిషత్" } },
    { number: 9, title: { en: "Chāndogya Upaniṣad", te: "ఛాందోగ్యోపనిషత్" } },
    { number: 10, title: { en: "Bṛhadāraṇyaka Upaniṣad", te: "బృహదారణ్యకోపనిషత్" }, verses: [
      { n: 28, ref: "Bṛhad. 1.3.28", sa: "असतो मा सद्गमय । तमसो मा ज्योतिर्गमय ।\nमृत्योर्मामृतं गमय ॥", iast: "asato mā sad gamaya | tamaso mā jyotir gamaya |\nmṛtyor māmṛtaṃ gamaya ||", en: "Lead me from the unreal to the real; lead me from darkness to light; lead me from death to immortality.", te: "అసత్యం నుండి సత్యానికి, చీకటి నుండి వెలుగుకు, మృత్యువు నుండి అమృతత్వానికి నన్ను నడిపించు." },
    ] },
  ]),
  book({
    id: "bhagavata", title: { en: "Śrīmad Bhāgavata Purāṇa", te: "శ్రీమద్భాగవత పురాణం" }, categoryId: "puranas", cover: art.puranas,
    attribution: { en: "Sage Vyāsa; narrated by Śuka", te: "వ్యాస మహర్షి; శుకుడు వినిపించినది" }, languages: ["sa", "te", "en"], sections: { en: "12 Skandhas", te: "12 స్కంధాలు" }, chapterLabel: { en: "Skandha", te: "స్కంధం" },
    description: { en: "The great Purāṇa of devotion to Bhagavān Viṣṇu and His avatāras.", te: "శ్రీ విష్ణువు మరియు ఆయన అవతారాలపై భక్తి మహాపురాణం." },
    about: { en: "Catalogue entry: the 12 Skandhas are listed. Text is not yet included.", te: "సూచిక నమోదు: 12 స్కంధాలు. పాఠ్యం ఇంకా చేర్చలేదు." },
    edition: "catalogue", source: "—", addedOrder: 9, popular: 75,
  }, Array.from({ length: 12 }, (_, i) => ({ number: i + 1, title: { en: `Skandha ${i + 1}`, te: `స్కంధం ${i + 1}` } }))),
  book({
    id: "vishnu-purana", title: { en: "Viṣṇu Purāṇa", te: "విష్ణు పురాణం" }, categoryId: "puranas", cover: art.puranas,
    attribution: { en: "Traditionally attributed to Sage Parāśara", te: "సాంప్రదాయికంగా పరాశర మహర్షి" }, languages: ["sa", "en"], sections: { en: "6 Aṃśas", te: "6 అంశాలు" }, chapterLabel: { en: "Aṃśa", te: "అంశం" },
    description: { en: "A Mahāpurāṇa on creation, genealogies and the glories of Viṣṇu.", te: "సృష్టి, వంశాలు, విష్ణు మహిమలపై మహాపురాణం." },
    about: { en: "Catalogue entry: the 6 Aṃśas are listed. Text is not yet included.", te: "సూచిక నమోదు: 6 అంశాలు. పాఠ్యం ఇంకా చేర్చలేదు." },
    edition: "catalogue", source: "—", addedOrder: 10, popular: 30,
  }, Array.from({ length: 6 }, (_, i) => ({ number: i + 1, title: { en: `Aṃśa ${i + 1}`, te: `అంశం ${i + 1}` } }))),
  book({
    id: "shiva-purana", title: { en: "Śiva Purāṇa", te: "శివ పురాణం" }, categoryId: "puranas", cover: art.puranas,
    attribution: { en: "Traditionally attributed to Sage Vyāsa", te: "సాంప్రదాయికంగా వ్యాస మహర్షి" }, languages: ["sa", "en"], sections: { en: "Saṃhitās (varies by recension)", te: "సంహితలు (ప్రతిని బట్టి)" }, chapterLabel: { en: "Saṃhitā", te: "సంహిత" },
    description: { en: "A Purāṇa centred on Lord Śiva, his glories and worship.", te: "శివుని మహిమ, ఆరాధనపై పురాణం." },
    about: { en: "Catalogue entry: section structure differs between recensions; text is not yet included.", te: "సూచిక నమోదు: భాగాల సంఖ్య ప్రతులను బట్టి మారుతుంది; పాఠ్యం ఇంకా చేర్చలేదు." },
    edition: "catalogue", source: "—", addedOrder: 11, popular: 60,
  }, []),
  book({
    id: "yoga-sutras", title: { en: "Yoga Sūtras of Patañjali", te: "పతంజలి యోగసూత్రాలు" }, categoryId: "yoga", cover: art.yoga,
    attribution: { en: "Sage Patañjali", te: "పతంజలి మహర్షి" }, languages: ["sa", "te", "en"], sections: { en: "4 Pādas", te: "4 పాదాలు" }, chapterLabel: { en: "Pāda", te: "పాదం" },
    description: { en: "The classical text of Yoga philosophy and practice.", te: "యోగ దర్శనం మరియు సాధనకు ప్రామాణిక గ్రంథం." },
    about: { en: "Demo edition: the four Pādas with sūtras 1.1–1.2.", te: "డెమో సంచిక: నాలుగు పాదాలు, సూత్రాలు 1.1–1.2." },
    edition: "demo", source: `${PD} Meanings: prototype renderings.`, addedOrder: 12, popular: 65,
  }, [
    { number: 1, title: { en: "Samādhi Pāda", te: "సమాధి పాదం" }, verses: [
      { n: 1, ref: "1.1", sa: "अथ योगानुशासनम् ॥", iast: "atha yogānuśāsanam ||", en: "Now begins the teaching of Yoga.", te: "ఇప్పుడు యోగ శాసనం (బోధ) ప్రారంభమవుతుంది." },
      { n: 2, ref: "1.2", sa: "योगश्चित्तवृत्तिनिरोधः ॥", iast: "yogaś citta-vṛtti-nirodhaḥ ||", en: "Yoga is the stilling of the fluctuations of the mind.", te: "చిత్తవృత్తులను నిరోధించడమే యోగం." },
    ] },
    { number: 2, title: { en: "Sādhana Pāda", te: "సాధన పాదం" } },
    { number: 3, title: { en: "Vibhūti Pāda", te: "విభూతి పాదం" } },
    { number: 4, title: { en: "Kaivalya Pāda", te: "కైవల్య పాదం" } },
  ]),
  book({
    id: "brahma-sutras", title: { en: "Brahma Sūtras", te: "బ్రహ్మసూత్రాలు" }, categoryId: "darshanas", cover: art.brahma,
    attribution: { en: "Bādarāyaṇa (traditionally identified with Vyāsa)", te: "బాదరాయణుడు (వ్యాసుడని సంప్రదాయం)" }, languages: ["sa", "te", "en"], sections: { en: "4 Adhyāyas", te: "4 అధ్యాయాలు" }, chapterLabel: { en: "Adhyāya", te: "అధ్యాయం" },
    description: { en: "The aphoristic foundation of Vedānta philosophy.", te: "వేదాంత దర్శనానికి సూత్రరూప పునాది." },
    about: { en: "Demo edition: the four Adhyāyas with the first two sūtras.", te: "డెమో సంచిక: నాలుగు అధ్యాయాలు, మొదటి రెండు సూత్రాలు." },
    edition: "demo", source: `${PD} Meanings: prototype renderings.`, addedOrder: 13, popular: 45,
  }, [
    { number: 1, title: { en: "Samanvaya Adhyāya", te: "సమన్వయాధ్యాయం" }, verses: [
      { n: 1, ref: "1.1.1", sa: "अथातो ब्रह्मजिज्ञासा ॥", iast: "athāto brahma-jijñāsā ||", en: "Now, therefore, the inquiry into Brahman.", te: "కనుక, ఇప్పుడు బ్రహ్మ జిజ్ఞాస (విచారణ)." },
      { n: 2, ref: "1.1.2", sa: "जन्माद्यस्य यतः ॥", iast: "janmādy asya yataḥ ||", en: "(Brahman is) that from which the origin, sustenance and dissolution of this universe proceed.", te: "ఈ జగత్తు యొక్క జన్మ, స్థితి, లయాలు దేని నుండి కలుగుతాయో అదే బ్రహ్మం." },
    ] },
    { number: 2, title: { en: "Avirodha Adhyāya", te: "అవిరోధాధ్యాయం" } },
    { number: 3, title: { en: "Sādhana Adhyāya", te: "సాధనాధ్యాయం" } },
    { number: 4, title: { en: "Phala Adhyāya", te: "ఫలాధ్యాయం" } },
  ]),
  book({
    id: "manusmriti", title: { en: "Manusmṛti – Dharma Śāstra", te: "మనుస్మృతి – ధర్మశాస్త్రం" }, categoryId: "dharma", cover: art.dharma,
    attribution: { en: "Traditionally attributed to Manu", te: "సాంప్రదాయికంగా మనువు" }, languages: ["sa", "en"], sections: { en: "12 Adhyāyas", te: "12 అధ్యాయాలు" }, chapterLabel: { en: "Adhyāya", te: "అధ్యాయం" },
    description: { en: "A classical Dharma Śāstra text on conduct, law and duty.", te: "ఆచారం, ధర్మం, కర్తవ్యాలపై ప్రాచీన ధర్మశాస్త్రం." },
    about: { en: "Catalogue entry: 12 Adhyāyas listed. Text is not yet included.", te: "సూచిక నమోదు: 12 అధ్యాయాలు. పాఠ్యం ఇంకా చేర్చలేదు." },
    edition: "catalogue", source: "—", addedOrder: 14, popular: 20,
  }, Array.from({ length: 12 }, (_, i) => ({ number: i + 1, title: { en: `Adhyāya ${i + 1}`, te: `అధ్యాయం ${i + 1}` } }))),
  book({
    id: "narada-bhakti", title: { en: "Nārada Bhakti Sūtra", te: "నారద భక్తి సూత్రాలు" }, categoryId: "stotras", cover: art.brahma,
    attribution: { en: "Sage Nārada", te: "నారద మహర్షి" }, languages: ["sa", "te", "en"], sections: { en: "84 Sūtras", te: "84 సూత్రాలు" }, chapterLabel: { en: "Section", te: "భాగం" },
    description: { en: "Aphorisms on the nature and practice of bhakti (devotion).", te: "భక్తి స్వరూపం, సాధనపై సూత్రాలు." },
    about: { en: "Demo edition: the opening two sūtras.", te: "డెమో సంచిక: మొదటి రెండు సూత్రాలు." },
    edition: "demo", source: `${PD} Meanings: prototype renderings.`, addedOrder: 15, popular: 55,
  }, [
    { number: 1, title: { en: "Nature of Bhakti", te: "భక్తి స్వరూపం" }, verses: [
      { n: 1, ref: "1", sa: "अथातो भक्तिं व्याख्यास्यामः ॥", iast: "athāto bhaktiṃ vyākhyāsyāmaḥ ||", en: "Now, therefore, we shall expound bhakti.", te: "ఇప్పుడు భక్తిని వివరిస్తాము." },
      { n: 2, ref: "2", sa: "सा त्वस्मिन् परमप्रेमरूपा ॥", iast: "sā tv asmin parama-prema-rūpā ||", en: "It is of the nature of supreme love for Him.", te: "అది భగవంతునిపై పరమ ప్రేమ స్వరూపమైనది." },
    ] },
  ]),
];

export const AUDIO_TRACKS: AudioTrack[] = (["te", "en"] as const).map((lang) => ({
  id: `gita-c7-${lang}`, bookId: "bhagavad-gita", chapterId: "bhagavad-gita-c7", lang,
  file: lang === "te" ? require("../../assets/audio/gita7_te.mp3") : require("../../assets/audio/gita7_en.mp3"),
  duration: (timings as any)[lang].duration, bytes: (timings as any)[lang].bytes, segments: (timings as any)[lang].segments,
}));

export const MANTRAS = [
  { id: "gayatri", verseId: "rig-veda-c3-v10", title: { en: "Gāyatrī Mantra", te: "గాయత్రీ మంత్రం" } },
  { id: "asato", verseId: "upanishads-c10-v28", title: { en: "Pavamāna Mantra (Asato mā)", te: "పవమాన మంత్రం (అసతో మా)" } },
  { id: "isha", verseId: "upanishads-c1-v1", title: { en: "Īśāvāsya Mantra", te: "ఈశావాస్య మంత్రం" } },
  { id: "uttishthata", verseId: "upanishads-c3-v14", title: { en: "Uttiṣṭhata Jāgrata", te: "ఉత్తిష్ఠత జాగ్రత" } },
];

// ---------- helpers ----------
export const getBook = (id: string) => BOOKS.find((b) => b.id === id);
export const getChapter = (id: string) => BOOKS.flatMap((b) => b.chapters).find((c) => c.id === id);
export const ALL_VERSES: Verse[] = BOOKS.flatMap((b) => b.chapters.flatMap((c) => c.verses));
export const getVerse = (id: string) => ALL_VERSES.find((v) => v.id === id);
export const bookVerses = (bookId: string) => ALL_VERSES.filter((v) => v.bookId === bookId);
export const getTrack = (chapterId: string, lang: string) =>
  AUDIO_TRACKS.find((t) => t.chapterId === chapterId && t.lang === lang) ?? AUDIO_TRACKS.find((t) => t.chapterId === chapterId);
export const firstReadableChapter = (b: Book) => b.chapters.find((c) => c.verses.length) ?? b.chapters[0];
export const bookBytes = (b: Book) => JSON.stringify(b.chapters).length;

// Daily verse rotates through curated verses by day of year.
const DAILY = ["bhagavad-gita-c7-v3", "upanishads-c10-v28", "bhagavad-gita-c7-v7", "rig-veda-c3-v10", "upanishads-c3-v14", "bhagavad-gita-c7-v8", "upanishads-c5-v6", "yoga-sutras-c1-v2"];
export function dailyVerse(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const day = Math.floor((date.getTime() - start) / 86400000);
  return getVerse(DAILY[day % DAILY.length])!;
}
