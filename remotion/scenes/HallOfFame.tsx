import { interpolate, useCurrentFrame } from "remotion";
import type { HallOfFameProps } from "@/lib/types";

export const HallOfFameScene = ({ title, description }: HallOfFameProps) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#0d1117] px-20 text-[#c9d1d9]">
      <div className="w-[980px] rounded-xl border border-[#30363d] bg-[#161b22]/90 p-10">
        <p className="text-sm uppercase tracking-[0.35em] text-[#3fb950]">Hall Of Fame</p>
        <h2 className="mt-6 text-5xl font-semibold text-[#f0f6fc]">{title}</h2>
        <p className="mt-10 max-w-4xl text-3xl text-[#c9d1d9]" style={{ opacity }}>
          {description}
        </p>
        <p className="mt-10 text-lg text-[#3fb950]">Respect where respect is due.</p>
      </div>
    </div>
  );
};
