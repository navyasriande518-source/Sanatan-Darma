import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import { Modal, Pressable, Share, View } from "react-native";
import { captureRef } from "react-native-view-shot";

import { Verse } from "@/src/data/content";
import { radius, spacing, useTheme } from "@/src/theme";
import { FONTS, Icon, Txt } from "./ui";

export function VerseShareCard({ verse, title, translation, script }: { verse: Verse; title: string; translation: string; script: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ width: 340, padding: 28, backgroundColor: colors.maroon, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.gold }}>
      <Txt v="heading" size={14} color={colors.goldLight} style={{ textAlign: "center", letterSpacing: 1 }}>{title.toUpperCase()}</Txt>
      <Txt v="bold" size={18} color={colors.ivory} style={{ textAlign: "center", marginTop: spacing.sm }}>{verse.ref}</Txt>
      <View style={{ height: 1, backgroundColor: colors.gold, marginVertical: spacing.md }} />
      <Txt size={19} color={colors.ivory} style={{ textAlign: "center", fontFamily: FONTS.sa, lineHeight: 34 }}>{script}</Txt>
      <Txt size={17} color={colors.ivory} style={{ textAlign: "center", marginTop: spacing.md, lineHeight: 27 }}>{translation}</Txt>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.lg }}>
        <Icon name="spa-outline" size={18} color={colors.goldLight} />
        <View style={{ flex: 1, height: 1, backgroundColor: colors.gold }} />
        <Txt size={12} color={colors.goldLight} style={{ letterSpacing: 1 }}>SANATANA DHARMA</Txt>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.gold }} />
        <Icon name="spa-outline" size={18} color={colors.goldLight} />
      </View>
    </View>
  );
}

export function VerseShareModal({ visible, verse, title, translation, script, onClose, toast }: {
  visible: boolean; verse: Verse | null; title: string; translation: string; script: string; onClose: () => void; toast: (message: string) => void;
}) {
  const { colors } = useTheme();
  const cardRef = useRef<any>(null);
  const [sharing, setSharing] = useState(false);
  if (!verse) return null;

  const share = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: `${title} ${verse.ref}` });
      } else {
        await Share.share({ message: `${title} ${verse.ref}\n\n${script}\n\n${translation}` });
      }
      onClose();
    } catch {
      toast("Unable to create the share image");
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(35, 10, 5, 0.78)", alignItems: "center", justifyContent: "center", padding: spacing.lg }}>
        <View ref={cardRef} collapsable={false}>
          <VerseShareCard verse={verse} title={title} translation={translation} script={script} />
        </View>
        <View style={{ width: 340, flexDirection: "row", gap: spacing.sm, marginTop: spacing.md }}>
          <Pressable onPress={onClose} style={{ flex: 1, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.ivory, alignItems: "center" }}>
            <Txt v="bold" color={colors.maroon}>Cancel</Txt>
          </Pressable>
          <Pressable testID="verse-share-card-confirm" onPress={share} style={{ flex: 1, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.gold, alignItems: "center" }}>
            <Txt v="bold" color={colors.burgundy}>{sharing ? "Preparing..." : "Share image"}</Txt>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
