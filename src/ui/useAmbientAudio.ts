import { useEffect, useRef } from "react";
import { useWorkshop } from "@/state/store";

/**
 * A barely-there workshop hum (filtered noise + low sine), synthesized —
 * no audio files. Off by default; the speakers are the diegetic toggle.
 */
export function useAmbientAudio() {
  const audioOn = useWorkshop((s) => s.audioOn);
  const ctxRef = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);

  useEffect(() => {
    if (!audioOn) {
      if (ctxRef.current) {
        const { ctx, gain } = ctxRef.current;
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      }
      return;
    }

    if (!ctxRef.current) {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);

      // soft brownish noise
      const len = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 320;
      noise.connect(filter).connect(gain);
      noise.start();

      // a warm low drone
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 55;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.35;
      osc.connect(oscGain).connect(gain);
      osc.start();

      ctxRef.current = { ctx, gain };
    }

    const { ctx, gain } = ctxRef.current;
    void ctx.resume();
    gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 1.2);
  }, [audioOn]);

  useEffect(
    () => () => {
      void ctxRef.current?.ctx.close();
    },
    [],
  );
}
