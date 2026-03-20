export interface SessionRecord {
  readonly sessionId: string
  readonly presenter: string
  readonly track: string
  readonly summary: string
}

export const demoSession: SessionRecord = {
  sessionId: 'stream-42',
  presenter: 'Ari Vector',
  track: 'React infrastructure',
  summary: 'Compare string rendering, streaming, prerendering, and postponed resume flows with one Suspense boundary.',
}

