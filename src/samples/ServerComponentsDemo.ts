// ============================================================================
// Server Components, Server Functions, and directives — comment-only demonstration
// ============================================================================
//
// Server Components and Server Functions require a framework-aware bundler
// (e.g., Next.js, Remix, or a custom RSC setup) that splits server and client
// modules at build time. They cannot fully run in a plain Vite client app.
//
// This repo now verifies the source-level boundaries through the companion
// workspace in node-samples/react-server-components/. This file still acts as
// the teaching reference for the mental model, transport rules, and runtime
// serialization caveats that the node-only workspace cannot execute for real.
//
// ============================================================================
// 'use client' directive
// ============================================================================
//
// Marks a file as a client component. Everything imported into this file
// runs in the browser. Without this directive (in an RSC-aware framework),
// components are server components by default.
//
//   // components/LikeButton.tsx
//   'use client'
//
//   import { useState } from 'react'
//
//   export function LikeButton({ postId }: { postId: string }) {
//     const [liked, setLiked] = useState(false)
//
//     return (
//       <button onClick={() => setLiked(!liked)}>
//         {liked ? '♥ Liked' : '♡ Like'}
//       </button>
//     )
//   }
//
// Key rules:
// - 'use client' must be the first statement in the file (before imports)
// - Client components can use hooks (useState, useEffect, etc.)
// - Client components can handle browser events (onClick, onChange, etc.)
// - Client components CANNOT be async functions
// - Client components receive props that must be serializable across the
//   server-client boundary (no functions, no class instances)
//
// ============================================================================
// Server Components (default in RSC frameworks)
// ============================================================================
//
// Server components run only on the server. They can:
// - Access databases, file systems, and secrets directly
// - Use async/await at the component level (no useEffect needed)
// - Import large libraries without increasing the client bundle
//
//   // app/posts/page.tsx (Next.js App Router convention)
//   // No 'use client' directive — this is a server component by default.
//
//   import { db } from '@/lib/database'
//   import { LikeButton } from '@/components/LikeButton'
//
//   interface Post {
//     readonly id: string
//     readonly title: string
//     readonly content: string
//   }
//
//   export default async function PostsPage() {
//     // This database query runs on the server — never exposed to the client.
//     const posts: Post[] = await db.query('SELECT * FROM posts ORDER BY created_at DESC')
//
//     return (
//       <main>
//         <h1>Posts</h1>
//         {posts.map(post => (
//           <article key={post.id}>
//             <h2>{post.title}</h2>
//             <p>{post.content}</p>
//             {/* LikeButton is a client component — it gets hydrated in the browser. */}
//             <LikeButton postId={post.id} />
//           </article>
//         ))}
//       </main>
//     )
//   }
//
// Key rules:
// - Server components CANNOT use hooks (no useState, useEffect, etc.)
// - Server components CANNOT handle browser events
// - Server components CAN be async functions
// - Server components CAN import client components (but not vice versa)
// - Server components CAN pass serializable props to client components
//
// ============================================================================
// 'use server' directive — Server Functions (formerly Server Actions)
// ============================================================================
//
// Marks an async function as a server function that can be called from client
// components. The framework generates an RPC endpoint automatically — the
// client sends a request, the server executes the function, and the result
// is sent back.
//
//   // actions/posts.ts
//   'use server'
//
//   import { db } from '@/lib/database'
//   import { revalidatePath } from 'next/cache'
//
//   export async function createPost(formData: FormData) {
//     const title = formData.get('title') as string
//     const content = formData.get('content') as string
//
//     // This runs on the server — the client never sees the database connection.
//     await db.query('INSERT INTO posts (title, content) VALUES ($1, $2)', [title, content])
//
//     // Tell the framework to refresh the posts page with new data.
//     revalidatePath('/posts')
//   }
//
// Using a server function from a client component:
//
//   // components/NewPostForm.tsx
//   'use client'
//
//   import { createPost } from '@/actions/posts'
//
//   export function NewPostForm() {
//     return (
//       <form action={createPost}>
//         <input name="title" placeholder="Title" required />
//         <textarea name="content" placeholder="Content" required />
//         <button type="submit">Create post</button>
//       </form>
//     )
//   }
//
// You can also define server functions inline inside server components:
//
//   export default function SettingsPage() {
//     async function updateTheme(formData: FormData) {
//       'use server'
//       const theme = formData.get('theme') as string
//       await db.query('UPDATE user_settings SET theme = $1', [theme])
//     }
//
//     return (
//       <form action={updateTheme}>
//         <select name="theme">
//           <option value="light">Light</option>
//           <option value="dark">Dark</option>
//         </select>
//         <button type="submit">Save</button>
//       </form>
//     )
//   }
//
// Key rules:
// - Server functions must be async
// - They can only receive serializable arguments
// - They always run on the server, even when called from client code
// - The 'use server' directive can be at the top of a file (all exports
//   become server functions) or inside a single async function
//
// ============================================================================
// Server vs Client component decision tree
// ============================================================================
//
// Does the component need...
//   Browser events (onClick, onChange)?       → 'use client'
//   Hooks (useState, useEffect, useRef)?      → 'use client'
//   Browser-only APIs (window, localStorage)? → 'use client'
//   Database or file system access?           → Server component (default)
//   Async data fetching at render time?       → Server component (default)
//   To stay out of the client bundle?         → Server component (default)
//
// ============================================================================
// Serialization boundary
// ============================================================================
//
// Props passed from server to client components must be serializable:
//
//   Allowed:    string, number, boolean, null, Date, Map, Set, TypedArray,
//               plain objects, arrays, FormData, ReadableStream, Promises
//   NOT allowed: functions (except server functions), class instances,
//               Symbols, DOM nodes, Proxy objects
//
// Example of the boundary:
//
//   // Server component
//   export default async function Dashboard() {
//     const data = await fetchDashboardData()  // object with serializable fields
//
//     return (
//       <ClientChart
//         data={data}                   // ✅ serializable object
//         onRefresh={refreshData}       // ✅ server function (has 'use server')
//         // onClick={() => {}}         // ❌ plain function — not serializable
//       />
//     )
//   }

export {};
