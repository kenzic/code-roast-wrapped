import { interpolate, useCurrentFrame } from "remotion";
import type { CrimeStatProps } from "@/lib/types";

const severityColors: Record<CrimeStatProps["severity"], string> = {
  misdemeanor: "#58a6ff",
  felony: "#d29922",
  "capital offense": "#f85149",
};

export const CrimeStatScene = ({ crime, stat, severity }: CrimeStatProps) => {
  const frame = useCurrentFrame();
  const countIn = interpolate(frame, [0, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div className="flex h-full w-full flex-col justify-center bg-[#0d1117] px-20 text-[#c9d1d9]">
      <div className="w-[980px] rounded-xl border border-[#30363d] bg-[#161b22]/90 p-10">
        <p className="text-sm uppercase tracking-[0.35em] text-[#8b949e]">
          Issue Tracker
        </p>
        <h2 className="mt-5 max-w-4xl text-5xl font-semibold text-[#f0f6fc]">
          {crime}
        </h2>
        <p
          className="mt-8 text-6xl font-bold"
          style={{
            color: severityColors[severity],
            transform: `scale(${0.8 + countIn * 0.2})`,
            opacity: countIn,
          }}
        >
          {stat}
        </p>
        <p className="mt-6 text-lg uppercase tracking-[0.25em] text-[#8b949e]">
          Severity:{" "}
          <span style={{ color: severityColors[severity] }}>{severity}</span>
        </p>
      </div>
    </div>
  );
};
