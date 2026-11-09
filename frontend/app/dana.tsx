import React, { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { Sheet } from "@/src/components/Sheet";
import { Badge, Card, Chip, EmptyState, GoldButton, Icon, SectionTitle, Txt } from "@/src/components/ui";
import { Donation, useApp } from "@/src/store/AppContext";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

const PURPOSES = [
  { id: "Scripture Preservation", te: "గ్రంథ పరిరక్షణ", icon: "book-lock-outline" },
  { id: "Translation & Publishing", te: "అనువాదం & ప్రచురణ", icon: "translate" },
  { id: "Annadānam", te: "అన్నదానం", icon: "food-variant" },
  { id: "Temple Seva", te: "ఆలయ సేవ", icon: "home-variant-outline" },
  { id: "General Dāna", te: "సాధారణ దానం", icon: "hand-heart" },
];
const AMOUNTS = [101, 251, 501, 1001, 2501];

export default function Dana() {
  const { t, prefs, donations, addDonation, toast } = useApp();
  const s = useStyles();
  const { colors } = useTheme();
  const [purpose, setPurpose] = useState(PURPOSES[0].id);
  const [amount, setAmount] = useState<number | null>(501);
  const [custom, setCustom] = useState("");
  const [receipt, setReceipt] = useState<Donation | null>(null);
  const te = prefs.uiLang === "te";
  const value = custom ? Number(custom.replace(/[^0-9]/g, "")) : amount ?? 0;
  const pLabel = (id: string) => (te ? PURPOSES.find((p) => p.id === id)?.te ?? id : id);
  const locale = te ? "te-IN" : "en-IN";

  return (
    <Screen testID="dana-screen" back title={t("dana")} icon="hand-heart" keyboard>
      <View style={s.banner}><Icon name="alert-decagram-outline" size={20} color={colors.burgundy} /><Txt testID="dana-demo-banner" v="bold" size={14} color={colors.burgundy} style={{ flex: 1 }}>{t("demoOnly")}</Txt></View>
      <SectionTitle title={t("aboutDana")} />
      <Txt size={15} style={{ marginBottom: spacing.lg }}>{t("aboutDanaText")}</Txt>
      <SectionTitle title={t("purpose")} />
      {PURPOSES.map((p) => (
        <Pressable key={p.id} testID={`dana-purpose-${p.id.replace(/\W+/g, "-").toLowerCase()}`} onPress={() => setPurpose(p.id)} style={[s.opt, purpose === p.id && s.optActive]}>
          <Icon name={p.icon as any} size={22} color={colors.maroon} />
          <Txt v="semi" size={16} color={colors.maroon} style={{ flex: 1 }}>{pLabel(p.id)}</Txt>
          {purpose === p.id ? <Icon name="check-circle" size={20} color={colors.gold} /> : null}
        </Pressable>
      ))}
      <SectionTitle title={t("amount")} />
      <View style={s.wrap}>
        {AMOUNTS.map((a) => <Chip key={a} testID={`dana-amount-${a}`} label={`₹${a}`} active={!custom && amount === a} onPress={() => { setAmount(a); setCustom(""); }} />)}
      </View>
      <TextInput testID="dana-custom-amount" value={custom} onChangeText={(v) => setCustom(v.replace(/[^0-9]/g, ""))} keyboardType="number-pad" placeholder={t("customAmount")} placeholderTextColor={colors.muted} style={s.input} />
      <GoldButton testID="dana-contribute-button" label={`${t("contribute")} · ₹${value || 0}`} icon="hand-heart" onPress={() => { if (value > 0) setReceipt(addDonation(purpose, value)); else toast(t("enterAmount")); }} />

      <View style={{ height: spacing.lg }} />
      <SectionTitle title={t("danaHistory")} />
      {donations.length === 0 ? <EmptyState testID="dana-empty" icon="hand-heart-outline" text={t("noDonations")} /> : [...donations].reverse().map((d) => (
        <Card key={d.id} testID={`dana-record-${d.receiptNo}`} onPress={() => setReceipt(d)} style={s.rec}>
          <View style={{ flex: 1 }}>
            <Txt v="semi" size={15} color={colors.maroon}>{pLabel(d.purpose)}</Txt>
            <Txt size={12} color={colors.muted}>{new Date(d.at).toLocaleDateString(locale)} · {d.receiptNo}</Txt>
          </View>
          <Txt v="bold" size={17} color={colors.maroon}>₹{d.amount}</Txt>
          <Badge label="DEMO" />
        </Card>
      ))}

      <Sheet testID="dana-receipt" visible={!!receipt} onClose={() => setReceipt(null)} title={t("receipt")}>
        {receipt ? (
          <View style={s.receipt}>
            <Icon name="spa" size={40} color={colors.gold} style={{ alignSelf: "center" }} />
            <Txt v="heading" size={20} color={colors.maroon} style={{ textAlign: "center" }}>{t("appName")} {t("appSub")}</Txt>
            <Badge label={t("demoOnly")} tone="maroon" />
            {[[t("receiptNo"), receipt.receiptNo], [t("date"), new Date(receipt.at).toLocaleString(locale)], [t("purpose"), pLabel(receipt.purpose)], [t("amount"), `₹${receipt.amount}`]].map(([k, v]) => (
              <View key={k} style={s.rRow}><Txt size={15} color={colors.muted}>{k}</Txt><Txt testID={`receipt-${k}`} v="bold" size={15} color={colors.maroon}>{v}</Txt></View>
            ))}
            <GoldButton testID="dana-receipt-close" label={t("close")} onPress={() => setReceipt(null)} />
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  banner: { flexDirection: "row", gap: spacing.sm, alignItems: "center", backgroundColor: c.highlight, borderRadius: radius.md, borderWidth: 1, borderColor: c.gold, padding: spacing.md, marginBottom: spacing.md },
  opt: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.ivory, marginBottom: spacing.sm, minHeight: 50 },
  optActive: { backgroundColor: c.highlight, borderColor: c.gold, borderWidth: 2 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  input: { height: 48, borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: 16, color: c.onSurface, backgroundColor: c.ivory, marginBottom: spacing.md },
  rec: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm, paddingVertical: spacing.md },
  receipt: { gap: spacing.md, borderWidth: 2, borderColor: c.gold, borderRadius: radius.lg, padding: spacing.lg, backgroundColor: c.parchment, borderStyle: "dashed" },
  rRow: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: c.divider, paddingVertical: 6 },
}));
