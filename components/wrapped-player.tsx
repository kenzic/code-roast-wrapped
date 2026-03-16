import { Player } from "@remotion/player";
import { Renderer, TimelineSpec } from "@json-render/remotion";
import { componentRegistry } from "@/lib/registry";

/** Renders a timeline spec with Remotion Player and @json-render/remotion Renderer. */
export const WrappedPlayer = ({ spec }: { spec: TimelineSpec }) => {
  if (!spec.composition) {
    return null;
  }

  return (
    <>
      <Player
        component={Renderer}
        inputProps={{
          spec,
          components: componentRegistry,
        }}
        durationInFrames={spec.composition.durationInFrames}
        fps={spec.composition.fps}
        compositionWidth={spec.composition.width}
        compositionHeight={spec.composition.height}
        controls
        autoPlay
        style={{ width: "100%" }}
      />
    </>
  );
};
