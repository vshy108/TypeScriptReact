import { Suspense, use } from 'react'
import type { SessionRecord } from './sampleData.js'

function SessionPanel({ sessionPromise }: { readonly sessionPromise: Promise<SessionRecord> }) {
  // use() can suspend on the server too, which is what lets these APIs decide whether to stream, wait, or fall back.
  const session = use(sessionPromise)

  return (
    <main className="ssr-main" data-phase="resolved">
      <h1>{session.presenter}</h1>
      <p>{session.summary}</p>
      <dl>
        <dt>Session</dt>
        <dd>{session.sessionId}</dd>
        <dt>Track</dt>
        <dd>{session.track}</dd>
      </dl>
    </main>
  )
}

function ShellFallback() {
  return (
    <main className="ssr-main" data-phase="fallback">
      <h1>Preparing streamed session...</h1>
      <p>Suspense fallback shell emitted while the server is still waiting on the data promise.</p>
    </main>
  )
}

export function ServerDocument({
  modeLabel,
  sessionPromise,
}: {
  readonly modeLabel: string
  readonly sessionPromise: Promise<SessionRecord>
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{modeLabel}</title>
      </head>
      <body>
        <header>
          <p>React server sample</p>
          <strong>{modeLabel}</strong>
        </header>

        <Suspense fallback={<ShellFallback />}>
          <SessionPanel sessionPromise={sessionPromise} />
        </Suspense>
      </body>
    </html>
  )
}
