// ============================================================================
// React Compiler — comment-only demonstration
// ============================================================================
//
// The React Compiler (previously React Forget) is a build-time tool that
// automatically memoizes components and hooks. This repo now verifies the
// source-level directive boundaries through the companion workspace in
// node-samples/react-compiler/, but the real transformed output still requires
// a dedicated Babel or SWC plugin.
//
// This file shows what compiled code looks like and how the two directives
// ("use memo" and "use no memo") control the compiler's behavior once the
// actual compiler plugin is available.
//
// To enable the compiler in a real project:
//
// 1. Install the plugin:
//    npm install babel-plugin-react-compiler
//
// 2. Add to your Babel config:
//    {
//      plugins: [
//        ['babel-plugin-react-compiler', { target: '19' }]
//      ]
//    }
//
// 3. Or with Vite + @vitejs/plugin-react:
//    react({
//      babel: {
//        plugins: [['babel-plugin-react-compiler', { target: '19' }]]
//      }
//    })
//
// ============================================================================
// What the compiler does
// ============================================================================
//
// Without the compiler, you manually wrap expensive values in useMemo:
//
//   function ExpenseReport({ items }: { items: readonly Item[] }) {
//     const total = useMemo(
//       () => items.reduce((sum, item) => sum + item.amount, 0),
//       [items]
//     )
//     const sorted = useMemo(
//       () => [...items].sort((a, b) => b.amount - a.amount),
//       [items]
//     )
//     return (
//       <div>
//         <h2>Total: ${total}</h2>
//         <ul>
//           {sorted.map(item => <li key={item.id}>{item.name}: ${item.amount}</li>)}
//         </ul>
//       </div>
//     )
//   }
//
// With the compiler enabled, you write the same code without useMemo.
// The compiler injects memoization automatically at build time:
//
//   function ExpenseReport({ items }: { items: readonly Item[] }) {
//     const total = items.reduce((sum, item) => sum + item.amount, 0)
//     const sorted = [...items].sort((a, b) => b.amount - a.amount)
//     return (
//       <div>
//         <h2>Total: ${total}</h2>
//         <ul>
//           {sorted.map(item => <li key={item.id}>{item.name}: ${item.amount}</li>)}
//         </ul>
//       </div>
//     )
//   }
//
// The compiled output would roughly look like:
//
//   function ExpenseReport({ items }) {
//     const $ = _c(4)           // compiler-managed cache with 4 slots
//     let total, sorted, jsx
//
//     if ($[0] !== items) {
//       total = items.reduce((sum, item) => sum + item.amount, 0)
//       sorted = [...items].sort((a, b) => b.amount - a.amount)
//       $[0] = items
//       $[1] = total
//       $[2] = sorted
//     } else {
//       total = $[1]
//       sorted = $[2]
//     }
//
//     if ($[3] !== sorted) {
//       jsx = <ul>{sorted.map(item => <li key={item.id}>...</li>)}</ul>
//       $[3] = sorted
//       $[4] = jsx
//     } else {
//       jsx = $[4]
//     }
//
//     return <div><h2>Total: ${total}</h2>{jsx}</div>
//   }
//
// ============================================================================
// "use memo" directive
// ============================================================================
//
// When the compiler is configured for opt-in mode (compilationMode: 'annotation'),
// only functions with the "use memo" directive are compiled:
//
//   function OptimizedDashboard({ data }: DashboardProps) {
//     "use memo"
//     // The compiler will auto-memoize all values and JSX in this component.
//     const chart = buildChartData(data)
//     const summary = computeSummary(data)
//     return <Dashboard chart={chart} summary={summary} />
//   }
//
//   function SimpleHeader({ title }: { title: string }) {
//     // No directive — the compiler leaves this component alone.
//     return <h1>{title}</h1>
//   }
//
// ============================================================================
// "use no memo" directive
// ============================================================================
//
// When the compiler runs in default (all-in) mode, "use no memo" opts out
// a specific function from compilation. This is useful when:
// - A component relies on referential identity of objects for non-React reasons
// - The compiler produces incorrect behavior in an edge case
// - You are debugging and want to isolate compiler effects
//
//   function CanvasRenderer({ scene }: CanvasProps) {
//     "use no memo"
//     // This function is excluded from compilation.
//     // Every render recalculates scene data as before.
//     // Useful when the component interacts with a mutable canvas API
//     // that does not follow React's immutability expectations.
//     const ctx = canvasRef.current?.getContext('2d')
//     drawScene(ctx, scene)
//     return <canvas ref={canvasRef} />
//   }
//
// ============================================================================
// When NOT to use the compiler
// ============================================================================
//
// The compiler assumes your code follows the Rules of React:
// - Components are pure functions of their props
// - Hooks are called unconditionally and in the same order
// - State mutations go through setState, not direct mutation
//
// If your code mutates shared objects, reads from mutable refs during render,
// or has side effects outside useEffect, the compiler may produce incorrect
// behavior. Fix the code first, then enable the compiler.

export {};
