// Context provider identity perf trap
// ------------------------------------
// This sample demonstrates the most common useContext performance mistake:
//
// When the provider value is a new object on every render, ALL consumers
// re-render — even if the data inside the object hasn't changed. React
// compares context values by reference (Object.is), so { same: "data" }
// created twice is two different objects and triggers a re-render.
//
// Fix: wrap the value in useMemo so React sees the same reference when
// the underlying data hasn't changed.

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Theme context — the trap and the fix
// ---------------------------------------------------------------------------

type PaletteMode = "ocean" | "sunset" | "forest";

interface ThemeValue {
  readonly palette: PaletteMode;
  readonly togglePalette: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used inside a ThemeContext provider.");
  }
  return value;
}

const paletteRotation: readonly PaletteMode[] = [
  "ocean",
  "sunset",
  "forest",
] as const;

function nextPalette(current: PaletteMode): PaletteMode {
  const index = paletteRotation.indexOf(current);
  const next = paletteRotation[(index + 1) % paletteRotation.length];
  return next ?? paletteRotation[0] ?? "ocean";
}

// ---------------------------------------------------------------------------
// Consumer components — memo'd to prove which renders are actually skipped
// ---------------------------------------------------------------------------

// Track render count via a ref updated in an effect (satisfies react-hooks/refs).
function useRenderCount() {
  const count = useRef(0);
  useEffect(() => {
    count.current += 1;
  });
  return count;
}

// Each consumer is wrapped with memo() so it ONLY re-renders when its props
// or consumed context value changes. This makes unnecessary re-renders visible.

const PaletteLabel = memo(function PaletteLabel() {
  const { palette } = useTheme();
  const renderCount = useRenderCount();

  return (
    <div className="sample-card">
      <p className="eyebrow">PaletteLabel</p>
      <strong>{palette}</strong>
      <span className="chip">Renders: {renderCount.current}</span>
    </div>
  );
});

const ToggleButton = memo(function ToggleButton() {
  const { togglePalette } = useTheme();
  const renderCount = useRenderCount();

  return (
    <div className="sample-card">
      <p className="eyebrow">ToggleButton</p>
      <button type="button" className="primary-button" onClick={togglePalette}>
        Toggle palette
      </button>
      <span className="chip">Renders: {renderCount.current}</span>
    </div>
  );
});

// This component does NOT consume the theme context at all.
// It should NEVER re-render when the provider value changes.
const UnrelatedCounter = memo(function UnrelatedCounter({
  parentRenders,
}: {
  readonly parentRenders: number;
}) {
  const renderCount = useRenderCount();

  return (
    <div className="sample-card">
      <p className="eyebrow">UnrelatedCounter (no context)</p>
      <strong>Parent renders: {parentRenders}</strong>
      <span className="chip">Own renders: {renderCount.current}</span>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Bug provider — creates a new value object on every render
// ---------------------------------------------------------------------------

// BUG: The value object is created inline, so every render produces a different
// reference. Even though palette and togglePalette haven't changed, React sees
// a new object and re-renders every consumer.
function BuggyProvider({ children }: { readonly children: React.ReactNode }) {
  const [palette, setPalette] = useState<PaletteMode>("ocean");

  // This function is also recreated every render — another identity change.
  function togglePalette() {
    setPalette((p) => nextPalette(p));
  }

  return (
    // BUG: { palette, togglePalette } is a new object every render.
    <ThemeContext value={{ palette, togglePalette }}>{children}</ThemeContext>
  );
}

// ---------------------------------------------------------------------------
// Fixed provider — memoizes the value so the reference is stable
// ---------------------------------------------------------------------------

function FixedProvider({ children }: { readonly children: React.ReactNode }) {
  const [palette, setPalette] = useState<PaletteMode>("ocean");

  // FIX: useCallback makes togglePalette referentially stable across renders.
  const togglePalette = useCallback(() => {
    setPalette((p) => nextPalette(p));
  }, []);

  // FIX: useMemo ensures the value object keeps the same reference as long
  // as palette and togglePalette haven't changed.
  const value = useMemo<ThemeValue>(
    () => ({ palette, togglePalette }),
    [palette, togglePalette],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

// ---------------------------------------------------------------------------
// Main sample component
// ---------------------------------------------------------------------------

export default function ContextIdentitySample() {
  const [mode, setMode] = useState<"buggy" | "fixed">("buggy");
  // Force parent re-renders with an unrelated counter to show the leak.
  const [unrelatedTick, setUnrelatedTick] = useState(0);
  const [parentRenders, setParentRenders] = useState(0);

  // Increment the parent render counter whenever unrelatedTick changes.
  // This keeps the count visible without writing to a ref during render.
  const parentRenderCount = parentRenders + unrelatedTick;

  const Provider = mode === "buggy" ? BuggyProvider : FixedProvider;

  return (
    <div className="context-identity-sample">
      <div className="section-heading">
        <p className="eyebrow">Implemented sample</p>
        <h3>Context provider identity perf trap</h3>
      </div>

      <p className="section-copy">
        The buggy provider creates a new value object on every render, so all
        context consumers re-render even when the data is unchanged. Click
        &ldquo;Force parent render&rdquo; to see the render counts climb. Switch
        to the fixed provider and notice that consumers skip unnecessary renders.
      </p>

      <div className="button-row">
        <button
          type="button"
          className={`primary-button ${mode === "buggy" ? "is-active" : ""}`}
          onClick={() => setMode("buggy")}
        >
          Buggy provider
        </button>
        <button
          type="button"
          className={`primary-button ${mode === "fixed" ? "is-active" : ""}`}
          onClick={() => setMode("fixed")}
        >
          Fixed provider
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setUnrelatedTick((t) => t + 1);
            setParentRenders((r) => r + 1);
          }}
        >
          Force parent render (tick: {unrelatedTick})
        </button>
      </div>

      <Provider>
        <div className="edge-case-sections">
          <PaletteLabel />
          <ToggleButton />
          <UnrelatedCounter parentRenders={parentRenderCount} />
        </div>
      </Provider>
    </div>
  );
}
