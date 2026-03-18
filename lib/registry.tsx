/**
 * Maps catalog component names to roast scene components for the @json-render/remotion Renderer.
 * Each entry receives { clip } and passes clip.props to the corresponding scene component.
 */
import type { ComponentRegistry } from "@json-render/remotion";
import type {
  CrimeStatProps,
  HallOfFameProps,
  RoastOpenerProps,
  ShameTimelineProps,
  VerdictProps,
} from "@/lib/types";
import { CrimeStatScene } from "@/remotion/scenes/CrimeStat";
import { HallOfFameScene } from "@/remotion/scenes/HallOfFame";
import { RoastOpenerScene } from "@/remotion/scenes/RoastOpener";
import { ShameTimelineScene } from "@/remotion/scenes/ShameTimeline";
import { VerdictScene } from "@/remotion/scenes/Verdict";

// Add componentRegistry here
export const componentRegistry: ComponentRegistry = {};
