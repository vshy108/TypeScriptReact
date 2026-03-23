// ============================================================================
// React ESLint rules — comment-only demonstration
// ============================================================================
//
// These lint rules are part of eslint-plugin-react-hooks, eslint-plugin-react-refresh,
// and the React Compiler lint plugin. They enforce the Rules of React at the code level.
// This repo now verifies the installed lint rules through the companion workspace in
// node-samples/react-lint-rules/. This file stays valuable as the teaching reference,
// and it still documents compiler-purity examples that are not executable here until
// eslint-plugin-react-compiler is added to the workspace.
//
// ============================================================================
// 1. react-hooks/exhaustive-deps
// ============================================================================
//
// This rule ensures that every value referenced inside useEffect, useMemo,
// useCallback, or other hooks with dependency arrays is listed in the deps.
//
// ❌ VIOLATION — missing `userId` in the dependency array:
//
//   function UserProfile({ userId }: { userId: string }) {
//     const [data, setData] = useState(null)
//
//     useEffect(() => {
//       fetchUser(userId).then(setData)
//     }, [])
//     // Warning: React Hook useEffect has a missing dependency: 'userId'.
//     // Either include it or remove the dependency array.
//
//     return <div>{data?.name}</div>
//   }
//
// ✅ CORRECT — all referenced values in deps:
//
//   function UserProfile({ userId }: { userId: string }) {
//     const [data, setData] = useState(null)
//
//     useEffect(() => {
//       fetchUser(userId).then(setData)
//     }, [userId])
//     // Now the effect re-runs whenever userId changes.
//
//     return <div>{data?.name}</div>
//   }
//
// Edge case — stable references do NOT need to be in deps:
//   - setState functions from useState (guaranteed stable)
//   - dispatch from useReducer (guaranteed stable)
//   - refs from useRef (the ref object is stable; ref.current is not)
//
//   function Counter() {
//     const [count, setCount] = useState(0)
//
//     useEffect(() => {
//       const id = setInterval(() => {
//         setCount(c => c + 1)  // functional updater — no dep on count
//       }, 1000)
//       return () => clearInterval(id)
//     }, [])  // ✅ empty deps is correct — setCount is stable
//   }
//
// ============================================================================
// 2. Purity rules (react-compiler/react-compiler)
// ============================================================================
//
// The React Compiler ESLint plugin (eslint-plugin-react-compiler) reports
// violations of the Rules of React. Components must be pure functions:
// same props → same output, no side effects during render.
//
// ❌ VIOLATION — mutating external state during render:
//
//   let renderCount = 0
//
//   function Dashboard({ data }: DashboardProps) {
//     renderCount++  // Side effect during render!
//     // Error: Mutating a variable declared outside a component or hook
//     // is not allowed. Consider using an effect instead.
//     return <div>Renders: {renderCount}</div>
//   }
//
// ✅ CORRECT — use useRef or useEffect for side effects:
//
//   function Dashboard({ data }: DashboardProps) {
//     const renderCountRef = useRef(0)
//
//     useEffect(() => {
//       renderCountRef.current++
//     })
//
//     return <div>{/* render count tracked without side effects */}</div>
//   }
//
// ❌ VIOLATION — mutating props:
//
//   function SortedList({ items }: { items: string[] }) {
//     items.sort()  // Mutates the prop array!
//     // Error: Mutating component props or hook arguments is not allowed.
//     return <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>
//   }
//
// ✅ CORRECT — create a new sorted copy:
//
//   function SortedList({ items }: { items: readonly string[] }) {
//     const sorted = [...items].sort()  // New array, prop untouched
//     return <ul>{sorted.map(item => <li key={item}>{item}</li>)}</ul>
//   }
//
// ============================================================================
// 3. react-refresh/only-export-components
// ============================================================================
//
// This rule (from eslint-plugin-react-refresh) ensures that files exporting
// React components only export components. Mixing component exports with
// non-component exports (constants, types at runtime, utilities) can break
// React Fast Refresh (hot module replacement) because the module cannot be
// safely hot-swapped.
//
// ❌ VIOLATION — mixing component and non-component exports:
//
//   export const API_URL = 'https://api.example.com'
//
//   export default function App() {
//     return <div>Hello</div>
//   }
//   // Warning: Fast Refresh only works when a file only exports components.
//   // Move API_URL to a separate file.
//
// ✅ CORRECT — separate files:
//
//   // config.ts
//   export const API_URL = 'https://api.example.com'
//
//   // App.tsx
//   export default function App() {
//     return <div>Hello</div>
//   }
//
// Exception: type-only exports are allowed because they are erased at compile time:
//
//   export type AppProps = { readonly title: string }
//
//   export default function App({ title }: AppProps) {
//     return <h1>{title}</h1>
//   }
//   // ✅ No warning — type exports don't affect Fast Refresh
//
// ============================================================================
// 4. react-hooks/rules-of-hooks
// ============================================================================
//
// Enforces that hooks are only called at the top level of a function component
// or a custom hook. Hooks cannot be called inside conditions, loops, or
// nested functions.
//
// ❌ VIOLATION — hook inside a condition:
//
//   function Profile({ showBio }: { showBio: boolean }) {
//     if (showBio) {
//       const [bio, setBio] = useState('')  // Conditional hook call!
//       // Error: React Hook "useState" is called conditionally.
//       // React Hooks must be called in the exact same order in every render.
//     }
//     return <div>Profile</div>
//   }
//
// ✅ CORRECT — always call the hook, conditionally use the value:
//
//   function Profile({ showBio }: { showBio: boolean }) {
//     const [bio, setBio] = useState('')  // Always called
//
//     return (
//       <div>
//         <h1>Profile</h1>
//         {showBio && <p>{bio}</p>}
//       </div>
//     )
//   }
//
// ❌ VIOLATION — hook inside a regular function (not a component or custom hook):
//
//   function getUser() {
//     const [user, setUser] = useState(null)  // Not a component!
//     // Error: React Hook "useState" is called in function "getUser"
//     // that is neither a React function component nor a custom Hook.
//   }
//
// ✅ CORRECT — custom hooks must start with "use":
//
//   function useUser() {
//     const [user, setUser] = useState(null)  // ✅ Custom hook
//     return user
//   }

export {};
