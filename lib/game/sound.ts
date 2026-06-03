"use client";

type SoundName = "countdown" | "correct" | "wrong" | "boost" | "checkpoint" | "finish";

let muted = false;
const cache = new Map<SoundName, import("howler").Howl>();

const soundShape: Record<SoundName, { frequency: number; duration: number; volume: number }> = {
  countdown: { frequency: 520, duration: 0.12, volume: 0.25 },
  correct: { frequency: 820, duration: 0.16, volume: 0.3 },
  wrong: { frequency: 180, duration: 0.2, volume: 0.28 },
  boost: { frequency: 1040, duration: 0.18, volume: 0.28 },
  checkpoint: { frequency: 620, duration: 0.22, volume: 0.26 },
  finish: { frequency: 940, duration: 0.38, volume: 0.32 }
};

export function setSoundMuted(nextMuted: boolean) {
  muted = nextMuted;
}

export async function playSound(name: SoundName) {
  if (muted || typeof window === "undefined") return;
  const { Howl } = await import("howler");
  let howl = cache.get(name);
  if (!howl) {
    const shape = soundShape[name];
    howl = new Howl({
      src: [makeToneDataUri(shape.frequency, shape.duration)],
      volume: shape.volume,
      html5: false
    });
    cache.set(name, howl);
  }
  howl.play();
}

function makeToneDataUri(frequency: number, duration: number) {
  const sampleRate = 22050;
  const samples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples * 2, true);

  for (let index = 0; index < samples; index += 1) {
    const envelope = Math.sin((Math.PI * index) / samples);
    const sample = Math.sin((2 * Math.PI * frequency * index) / sampleRate) * envelope;
    view.setInt16(44 + index * 2, sample * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}
