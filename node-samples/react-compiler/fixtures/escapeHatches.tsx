'use no memo'

export function GlobalOptOutPanel({ label }: { readonly label: string }) {
  return <section>{label}</section>
}

export function CanvasRenderer({ frame }: { readonly frame: string }) {
  'use no memo'

  return <canvas aria-label={frame} />
}
