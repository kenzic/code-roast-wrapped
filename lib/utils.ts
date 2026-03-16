import type { TimelineSpec } from "@json-render/remotion";
import { roastComponentDefinitions } from "./catalog";
import { SCENE_DURATION_FRAMES, FPS } from "./catalog";

function isClipLike(c: unknown): c is {
  id: string;
  trackId: string;
  component: string;
  props: Record<string, unknown>;
  from: number;
  durationInFrames: number;
} {
  if (!c || typeof c !== "object") return false;
  const o = c as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.trackId === "string" &&
    typeof o.component === "string" &&
    o.props != null &&
    typeof o.props === "object" &&
    typeof o.from === "number" &&
    typeof o.durationInFrames === "number"
  );
}

/** Validates a streamed spec: clip shape, 4–7 clips, RoastOpener first, Verdict last, at least one HallOfFame; normalizes composition/tracks/transitions. */
export function validateTimelineSpec(spec: unknown): {
  success: boolean;
  data?: TimelineSpec;
  error?: string;
} {
  const doc = spec as { spec?: TimelineSpec; catalog?: unknown };
  const specPart = (doc?.spec ?? doc) as TimelineSpec | undefined;
  if (!specPart || typeof specPart !== "object") {
    return {
      success: false,
      error:
        "Generated spec is missing or invalid (expected an object with spec or timeline fields).",
    };
  }

  const clips = Array.isArray(specPart.clips) ? specPart.clips : [];
  if (clips.length === 0) {
    return {
      success: false,
      error: "Generated spec has no clips array or it is empty.",
    };
  }

  const invalidClip = clips.find((c) => !isClipLike(c));
  if (invalidClip) {
    return {
      success: false,
      error:
        "Each clip must have id, trackId, component, props, from, and durationInFrames.",
    };
  }

  const timelineSpec = specPart;

  if (clips.length < 4 || clips.length > 7) {
    return {
      success: false,
      error: "Spec must contain between 4 and 7 clips.",
    };
  }

  const firstComponent = clips[0]?.component;
  const lastComponent = clips[clips.length - 1]?.component;

  if (firstComponent !== "RoastOpener") {
    return {
      success: false,
      error: "First clip must be RoastOpener.",
    };
  }

  if (lastComponent !== "Verdict") {
    return {
      success: false,
      error: "Last clip must be Verdict.",
    };
  }

  const hasHallOfFame = clips.some((c) => c.component === "HallOfFame");
  if (!hasHallOfFame) {
    return {
      success: false,
      error: "Spec must include at least one HallOfFame clip.",
    };
  }

  const allowed = Object.keys(roastComponentDefinitions) as string[];
  const hasInvalid = clips.some((c) => !allowed.includes(c.component));
  if (hasInvalid) {
    return {
      success: false,
      error: "Spec includes unsupported component types.",
    };
  }

  const durationInFrames = clips.reduce(
    (sum, clip) => sum + (clip.durationInFrames ?? SCENE_DURATION_FRAMES),
    0,
  );

  const defaultTransition = { type: "fade", durationInFrames: 15 };
  const normalizedClips = (timelineSpec.clips ?? []).map((clip) => ({
    ...clip,
    transitionIn: clip.transitionIn ?? defaultTransition,
    transitionOut: clip.transitionOut ?? defaultTransition,
  }));

  const normalized: TimelineSpec = {
    ...timelineSpec,
    composition: timelineSpec.composition ?? {
      id: "roast",
      fps: FPS,
      width: 1280,
      height: 720,
      durationInFrames,
    },
    tracks: timelineSpec.tracks?.length
      ? timelineSpec.tracks
      : [
          {
            id: "main",
            name: "Main",
            type: "video",
            enabled: true,
          },
        ],
    clips: normalizedClips,
    audio: timelineSpec.audio ?? { tracks: [] },
  };
  if (normalized.composition) {
    normalized.composition.durationInFrames = durationInFrames;
  }
  return { success: true, data: normalized };
}
