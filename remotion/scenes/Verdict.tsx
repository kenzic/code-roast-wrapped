import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { VerdictProps } from "@/lib/types";

export const VerdictScene = ({ archetype, description, sentence }: VerdictProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 18, mass: 0.8 } });

  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#0d1117] px-20 text-[#c9d1d9]">
      <div className="w-[980px] rounded-xl border border-[#30363d] bg-[#161b22]/90 p-10">
        <p className="text-sm uppercase tracking-[0.35em] text-[#a371f7]">Final Verdict</p>
        <h2
          className="mt-6 text-5xl font-bold text-[#f0f6fc]"
          style={{ transform: `translateY(${(1 - rise) * 60}px)` }}
        >
          {archetype}
        </h2>
        <p className="mt-8 max-w-4xl text-3xl text-[#c9d1d9]">{description}</p>
        <p className="mt-10 rounded-md border border-[#8957e5]/70 bg-[#8957e5]/15 p-5 text-2xl text-[#d2a8ff]">
          {sentence}
        </p>
      </div>
    </div>
  );
};
