/**
 * Catalog and validation for the roast video timeline.
 * Defines scene components (Zod props + descriptions), builds the catalog used by
 * the client and by catalog.prompt(); validates streamed specs from the API.
 */
import { defineCatalog } from "@json-render/core";
import {
  schema,
  standardEffectDefinitions,
  standardTransitionDefinitions,
} from "@json-render/remotion/server";
import { z } from "zod";

export const SCENE_DURATION_FRAMES = 150;
export const FPS = 30;

/** Scene component definitions (Zod props + metadata). Single source of truth for catalog and inferred types. */
export const roastComponentDefinitions = {
  RoastOpener: {
    description:
      "Full-screen opener with repo + owner and a sharp roast tagline.",
    props: z.object({
      repoName: z.string(),
      ownerName: z.string(),
      tagline: z.string(),
    }),
    type: "scene",
    defaultDuration: SCENE_DURATION_FRAMES,
  },
  CrimeStat: {
    description:
      "A metric framed as a criminal offense with severity label for humor.",
    props: z.object({
      crime: z.string(),
      stat: z.string(),
      severity: z.enum(["misdemeanor", "felony", "capital offense"]),
    }),
    type: "scene",
    defaultDuration: SCENE_DURATION_FRAMES,
  },
  ShameTimeline: {
    description: "Highlights a suspicious commit timeline trend.",
    props: z.object({
      label: z.string(),
      insight: z.string(),
    }),
    type: "scene",
    defaultDuration: SCENE_DURATION_FRAMES,
  },
  HallOfFame: {
    description: "One genuinely positive highlight to keep it friendly.",
    props: z.object({
      title: z.string(),
      description: z.string(),
    }),
    type: "scene",
    defaultDuration: SCENE_DURATION_FRAMES,
  },
  Verdict: {
    description: "Final developer archetype and mock sentence.",
    props: z.object({
      archetype: z.string(),
      description: z.string(),
      sentence: z.string(),
    }),
    type: "scene",
    defaultDuration: SCENE_DURATION_FRAMES,
  },
};

export const catalog = defineCatalog(schema, {
  components: roastComponentDefinitions,
  transitions: standardTransitionDefinitions,
  effects: standardEffectDefinitions,
});

const roastSystemPrompt = `
You are Code Roast, a sharp but fair code reviewer.
You receive structured GitHub repo data and must produce a roast video spec.

STYLE:
- Tone is "friendly code review that got a little too honest".
- Every roast claim must tie to actual repo evidence (numbers, file names, commit messages, timestamps, language mix).
- No generic jokes. If data does not support a claim, do not invent it.
- Keep copy short, punchy, and specific.

OUTPUT RULES:
- composition: id 'roast', fps 30, width 1280, height 720, durationInFrames = 150 * number of clips.
- Output a timeline spec under the key 'spec' with: spec.composition (id, fps, width, height, durationInFrames), spec.tracks (array with one track: id 'main', name 'Main', type 'video', enabled true), spec.clips (array of clips, each with id, trackId 'main', component, props, from, durationInFrames 150), spec.audio (object with tracks: []).
- Build a complete linear scene sequence.
- RoastOpener must be first and Verdict must be last.
- Scene count must be between 4 and 7.
- Include at least one HallOfFame scene with real praise tied to evidence.
`.trim();

// Unfortunately, we shouldn't need to define prompt types manually here, but the current Remotion schema doesn't expose them.
// Hopefully this will be resolved soon. I opened an issue
const propTypeFix = `
Available Component Props:
* RoastOpener: { repoName: string, ownerName: string, tagline: string }
* CrimeStat: { crime: string, stat: string, severity: "misdemeanor" | "felony" | "capital offense" }
* ShameTimeline: { label: string, insight: string }
* HallOfFame: { title: string, description: string }
* Verdict: { archetype: string, description: string, sentence: string }
`.trim();

/** Builds the catalog-based prompt string (uses Remotion schema). */
export function getCatalogPrompt(): string {
  return catalog.prompt({
    customRules: [roastSystemPrompt, propTypeFix],
  });
}
