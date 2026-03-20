// ============================================================================
// Hydration mismatch detection — comment-only demonstration
// ============================================================================
//
// Hydration is the process where React attaches event listeners and internal
// state to server-rendered HTML instead of re-creating the entire DOM tree.
// A hydration mismatch occurs when the client-rendered tree differs from the
// server HTML. React warns in the console and may discard the server HTML.
//
// This file cannot run a real hydration demo because the Vite dev server
// does not perform server-side rendering. The separate-entry hydration sample
// (src/hydration/) demonstrates the client-side hydration API itself. This
// file focuses on the MISMATCH edge cases and detection behavior.
//
// ============================================================================
// How hydration works
// ============================================================================
//
// 1. The server renders the component tree to HTML and sends it to the browser.
// 2. The browser displays the HTML immediately (fast first paint).
// 3. React boots on the client and "hydrates" the existing DOM:
//    - It walks the server HTML and the client component tree in parallel.
//    - It attaches event listeners and internal fiber state to existing nodes.
//    - It does NOT re-create DOM nodes — it reuses the server-rendered ones.
//
// Hydration is much faster than a full client render because the DOM already
// exists and React only needs to reconcile and attach.
//
// ============================================================================
// What causes hydration mismatches
// ============================================================================
//
// A mismatch happens when the client-rendered output differs from the server
// HTML. Common causes:
//
// 1. NON-DETERMINISTIC VALUES IN RENDER:
//
//    // ❌ BAD — Date.now() differs between server and client
//    function Timestamp() {
//      return <span>{Date.now()}</span>
//    }
//
//    // ❌ BAD — Math.random() gives a different value on each call
//    function RandomId() {
//      return <div id={`el-${Math.random()}`}>content</div>
//    }
//
// 2. BROWSER-ONLY APIS IN RENDER:
//
//    // ❌ BAD — window is undefined on the server
//    function ViewportWidth() {
//      return <span>{window.innerWidth}px</span>
//    }
//
//    // ❌ BAD — typeof window check renders different content
//    function ClientOnly() {
//      if (typeof window !== "undefined") {
//        return <div>Client content</div>
//      }
//      return <div>Server content</div>
//    }
//
// 3. LOCALE AND TIMEZONE DIFFERENCES:
//
//    // ❌ RISKY — server locale may differ from client locale
//    function Price({ amount }: { amount: number }) {
//      return <span>{amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
//    }
//
// ============================================================================
// How React detects and reports mismatches
// ============================================================================
//
// React 18+ significantly improved mismatch detection and reporting:
//
// ● During hydration, React compares each DOM node against the expected
//   virtual DOM node. When text content or attributes differ, React logs a
//   detailed console error:
//
//     Warning: Text content did not match. Server: "1719856200000"
//     Client: "1719856200123"
//
// ● React 19 added a "diff view" in the console error that highlights
//   exactly which parts of the tree differ, making debugging much easier:
//
//     <div>
//   -   Server: 1719856200000
//   +   Client: 1719856200123
//     </div>
//
// ● RECOVERY BEHAVIOR:
//   - For TEXT mismatches, React patches the DOM node to match the client
//     value. The user sees a brief flicker but the app continues working.
//   - For STRUCTURAL mismatches (different element types, missing nodes),
//     React discards the server HTML for that subtree and re-renders from
//     scratch. This is expensive and defeats the purpose of SSR.
//
// ============================================================================
// How to fix / prevent hydration mismatches
// ============================================================================
//
// FIX 1: USE useEffect FOR CLIENT-ONLY VALUES
//
// useEffect runs only on the client, after hydration is complete. This
// guarantees the initial render matches the server output.
//
//    function Timestamp() {
//      const [time, setTime] = useState<number | null>(null)
//
//      useEffect(() => {
//        setTime(Date.now())
//      }, [])
//
//      // First render (during hydration): matches the server output
//      if (time === null) return <span>Loading...</span>
//      return <span>{time}</span>
//    }
//
// FIX 2: useSyncExternalStore WITH getServerSnapshot
//
// React's useSyncExternalStore hook accepts a separate getServerSnapshot
// parameter that provides the value used during server rendering:
//
//    function useMediaQuery(query: string): boolean {
//      return useSyncExternalStore(
//        (callback) => {
//          const mql = window.matchMedia(query)
//          mql.addEventListener("change", callback)
//          return () => mql.removeEventListener("change", callback)
//        },
//        () => window.matchMedia(query).matches,
//        () => false  // ← server snapshot: always false on the server
//      )
//    }
//
// FIX 3: suppressHydrationWarning
//
// For intentional mismatches (e.g., timestamps that must differ), React
// provides a prop to silence the warning on a per-element basis:
//
//    function Timestamp({ serverTime }: { serverTime: number }) {
//      return (
//        <time suppressHydrationWarning>
//          {typeof window !== "undefined" ? Date.now() : serverTime}
//        </time>
//      )
//    }
//
// WARNING: suppressHydrationWarning only suppresses the warning — it does
// NOT prevent the DOM patch. Use it sparingly; hiding mismatches can mask
// real bugs.
//
// FIX 4: useId FOR DETERMINISTIC IDS
//
// React's useId() hook generates the same ID on the server and client,
// avoiding mismatches caused by id generation:
//
//    function FormField({ label }: { label: string }) {
//      const id = useId()   // same on server and client
//      return (
//        <div>
//          <label htmlFor={id}>{label}</label>
//          <input id={id} />
//        </div>
//      )
//    }
//
// ============================================================================
// React 19 hydration improvements
// ============================================================================
//
// ● BETTER ERROR MESSAGES: React 19 shows a unified diff of the mismatch
//   in the console, making it much easier to locate the problematic node.
//
// ● PARTIAL RECOVERY: React 19 is smarter about recovering from mismatches.
//   Instead of discarding entire subtrees, it attempts node-by-node recovery.
//
// ● STRICT MODE DOUBLE-RENDER: In development, React Strict Mode renders
//   components twice to detect side effects. This does not directly detect
//   hydration mismatches but catches impure renders that often cause them.
//
// ● Suspense and streaming SSR: React 19's streaming SSR (`renderToPipeableStream`)
//   sends HTML in chunks. Each Suspense boundary flushes independently, and
//   the client hydrates each chunk as it arrives. Mismatches in one Suspense
//   boundary do NOT affect hydration of other boundaries.
//
// ============================================================================
// Summary of hydration mismatch edge cases
// ============================================================================
//
// | Cause                          | Fix                                      |
// |--------------------------------|------------------------------------------|
// | Date/time in render            | useEffect + useState for client value    |
// | Math.random() in render        | Move to useEffect or use server seed     |
// | window/document in render      | useEffect or useSyncExternalStore        |
// | Locale-dependent formatting    | Pass pre-formatted string from server    |
// | Generated IDs                  | useId() hook                             |
// | Intentional mismatch           | suppressHydrationWarning prop            |
// | Different data on server/client| Ensure same data is available on both    |

// Type-checked marker so this file participates in the build graph.
export const hydrationMismatchDemo = true as const;
