export function OptimizedDashboard({ scores }: { readonly scores: readonly number[] }) {
  'use memo'

  const total = scores.reduce((sum, score) => sum + score, 0)
  return <section>Total score: {total}</section>
}

export function SimpleHeader({ title }: { readonly title: string }) {
  return <h1>{title}</h1>
}
