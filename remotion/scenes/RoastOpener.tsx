import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { RoastOpenerProps } from "@/lib/types";

export const RoastOpenerScene = ({ repoName, ownerName, tagline }: RoastOpenerProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame, fps, config: { damping: 16, mass: 0.6 } });
  const subtitleOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#0d1117] px-20 text-[#c9d1d9]">
      <div className="w-[980px] rounded-xl border border-[#30363d] bg-[#161b22]/90 p-10 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-8 flex items-center justify-between">
          <p
            className="text-sm uppercase tracking-[0.4em] text-[#58a6ff]"
            style={{ opacity: subtitleOpacity }}
          >
            Code Roast • Build Log
          </p>
          <span className="rounded-full border border-[#238636]/60 bg-[#238636]/20 px-3 py-1 text-xs text-[#3fb950]">
            CI: passing
          </span>
        </div>
        <h1
          className="text-6xl font-bold tracking-tight text-[#f0f6fc]"
          style={{ transform: `translateY(${(1 - entrance) * 80}px)` }}
        >
          {repoName}
        </h1>
        <p className="mt-4 text-xl text-[#8b949e]" style={{ opacity: entrance }}>
          owner: @{ownerName}
        </p>
        <p className="mt-12 max-w-3xl border-l-4 border-[#58a6ff] pl-5 text-3xl text-[#79c0ff]">
          {tagline}
        </p>
      </div>
    </div>
  );
};
