import { interpolate, useCurrentFrame } from "remotion";
import type { ShameTimelineProps } from "@/lib/types";

export const ShameTimelineScene = ({ label, insight }: ShameTimelineProps) => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [0, 130], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#0d1117] px-20 text-[#c9d1d9]">
      <div className="w-[980px] rounded-xl border border-[#30363d] bg-[#161b22]/90 p-10">
        <p className="text-sm uppercase tracking-[0.35em] text-[#58a6ff]">Commit Timeline</p>
        <h2 className="mt-5 text-5xl font-semibold text-[#f0f6fc]">{label}</h2>
        <div className="relative mt-12 h-2 w-full overflow-hidden rounded-full bg-[#21262d]">
          <div
            className="h-full rounded-full bg-[#58a6ff] shadow-[0_0_24px_#58a6ff]"
            style={{ width: `${sweep}%` }}
          />
        </div>
        <div className="mt-3 flex gap-2">
          <span className="h-2 w-16 rounded bg-[#238636]" />
          <span className="h-2 w-12 rounded bg-[#58a6ff]" />
          <span className="h-2 w-20 rounded bg-[#8957e5]" />
        </div>
        <p className="mt-10 max-w-4xl text-3xl text-[#c9d1d9]">{insight}</p>
      </div>
    </div>
  );
};
