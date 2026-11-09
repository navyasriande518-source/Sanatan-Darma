import React from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { Icon, Txt } from "./ui";

export function Sheet({ visible, onClose, title, children, testID, scroll = true }: { visible: boolean; onClose: () => void; title?: string; children: React.ReactNode; testID?: string; scroll?: boolean }) {
  const insets = useSafeAreaInsets();
  const s = useStyles();
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.flex}>
        <Pressable style={s.backdrop} onPress={onClose} testID={testID ? `${testID}-backdrop` : undefined} />
        <View testID={testID} style={[s.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={s.handle} />
          {title ? (
            <View style={s.head}>
              <Txt v="heading" size={21} color={colors.maroon} style={{ flex: 1 }}>{title}</Txt>
              <Pressable testID={testID ? `${testID}-close` : "sheet-close"} onPress={onClose} hitSlop={10} style={s.close}>
                <Icon name="close" size={22} color={colors.maroon} />
              </Pressable>
            </View>
          ) : null}
          {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.sm }}>{children}</ScrollView> : children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Confirm({ visible, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }: { visible: boolean; title: string; message: string; confirmLabel: string; cancelLabel: string; onConfirm: () => void; onCancel: () => void }) {
  const s = useStyles();
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.center}>
        <View testID="confirm-dialog" style={s.dialog}>
          <Icon name="spa-outline" size={32} color={colors.gold} style={{ alignSelf: "center" }} />
          <Txt v="heading" size={22} color={colors.maroon} style={{ textAlign: "center" }}>{title}</Txt>
          <Txt size={15} style={{ textAlign: "center" }}>{message}</Txt>
          <View style={s.dRow}>
            <Pressable testID="confirm-cancel-button" onPress={onCancel} style={[s.dBtn, s.dCancel]}>
              <Txt v="bold" size={16} color={colors.maroon}>{cancelLabel}</Txt>
            </Pressable>
            <Pressable testID="confirm-ok-button" onPress={onConfirm} style={[s.dBtn, s.dOk]}>
              <Txt v="bold" size={16} color={colors.ivory}>{confirmLabel}</Txt>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((c) => ({
  flex: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...({ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 } as const), backgroundColor: c.overlay },
  sheet: {
    backgroundColor: c.ivory, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 2, borderColor: c.gold,
    paddingHorizontal: spacing.lg, maxHeight: "85%",
  },
  handle: { alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: c.cardBorder, marginVertical: spacing.sm },
  head: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  close: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, backgroundColor: c.overlay, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  dialog: { backgroundColor: c.ivory, borderRadius: radius.lg, borderWidth: 2, borderColor: c.gold, padding: spacing.xl, gap: spacing.md, width: "100%", maxWidth: 380 },
  dRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm },
  dBtn: { flex: 1, height: 48, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: c.gold },
  dCancel: { backgroundColor: c.parchment },
  dOk: { backgroundColor: c.maroon },
}));
