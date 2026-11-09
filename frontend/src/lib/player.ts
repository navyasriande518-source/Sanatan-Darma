import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";

// One module-level player for the whole app so only one narration plays at a time.
let player: AudioPlayer | null = null;
let currentId: string | null = null;

export function getPlayer(id: string, source: any): AudioPlayer {
  setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});
  if (!player) {
    player = createAudioPlayer(source, { updateInterval: 250 });
  } else if (currentId !== id) {
    player.pause();
    player.replace(source);
  }
  currentId = id;
  return player;
}

export function stopPlayer() {
  player?.pause();
}
