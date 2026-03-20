import { PassThrough } from 'node:stream'
import { pathToFileURL } from 'node:url'
import { renderToPipeableStream, renderToReadableStream, renderToStaticMarkup, renderToString, resume, resumeToPipeableStream } from 'react-dom/server.node'
import { prerender, resumeAndPrerender } from 'react-dom/static'
import { prerenderToNodeStream, resumeAndPrerenderToNodeStream } from 'react-dom/static.node'
import { ServerDocument } from './ServerDocument.js'
import { demoSession, type SessionRecord } from './sampleData.js'

interface Deferred<T> {
  readonly promise: Promise<T>
  resolve(value: T): void
  reject(reason?: unknown): void
}

interface RenderingModeSummary {
  readonly containsFallback: boolean
  readonly containsResolvedContent: boolean
  readonly hasBoundaryMarkers: boolean
}

interface ResumeModeSummary {
  readonly capturedPostponedState: boolean
  readonly preludeContainsFallback: boolean
  readonly resumedContainsResolvedContent: boolean
}

export interface StreamingSsrReport {
  readonly renderToString: RenderingModeSummary
  readonly renderToStaticMarkup: RenderingModeSummary
  readonly renderToReadableStream: RenderingModeSummary
  readonly renderToPipeableStream: RenderingModeSummary
  readonly prerender: {
    readonly capturedPostponedState: boolean
    readonly containsFallback: boolean
    readonly containsResolvedContent: boolean
  }
  readonly resume: ResumeModeSummary
  readonly prerenderToNodeStream: {
    readonly capturedPostponedState: boolean
    readonly preludeContainsFallback: boolean
  }
  readonly resumeToPipeableStream: ResumeModeSummary
  readonly resumeAndPrerender: {
    readonly containsFallback: boolean
    readonly containsResolvedContent: boolean
  }
  readonly resumeAndPrerenderToNodeStream: {
    readonly containsFallback: boolean
    readonly containsResolvedContent: boolean
  }
}

class Postponed extends Error {
  constructor() {
    super('Postponed this render on purpose so the resume APIs have opaque state to continue from.')
    this.name = 'Postponed'
  }
}

function createDeferred<T>(): Deferred<T> {
  let resolvePromise!: (value: T) => void
  let rejectPromise!: (reason?: unknown) => void

  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  return {
    promise,
    resolve(value) {
      resolvePromise(value)
    },
    reject(reason) {
      rejectPromise(reason)
    },
  }
}

function createNeverSettlingPromise<T>() {
  return new Promise<T>(() => {})
}

function scheduleSessionResolution(deferred: Deferred<SessionRecord>, delayMs = 10) {
  const timer = globalThis.setTimeout(() => {
    deferred.resolve(demoSession)
  }, delayMs)

  return () => {
    globalThis.clearTimeout(timer)
  }
}

function createResolvedDocument(modeLabel: string) {
  return <ServerDocument modeLabel={modeLabel} sessionPromise={Promise.resolve(demoSession)} />
}

function createPendingDocument(modeLabel: string, sessionPromise: Promise<SessionRecord>) {
  return <ServerDocument modeLabel={modeLabel} sessionPromise={sessionPromise} />
}

function summarizeMarkup(markup: string): RenderingModeSummary {
  return {
    containsFallback: markup.includes('Preparing streamed session'),
    containsResolvedContent: markup.includes(demoSession.presenter),
    hasBoundaryMarkers: markup.includes('<!--$'),
  }
}

async function webStreamToString(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader()
  return await webStreamReaderToString(reader)
}

async function webStreamReaderToString(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder()
  let result = ''

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    result += decoder.decode(value, { stream: true })
  }

  return result + decoder.decode()
}

async function nodeStreamToString(stream: NodeJS.ReadableStream) {
  return await new Promise<string>((resolve, reject) => {
    let result = ''
    stream.setEncoding('utf8')
    stream.on('data', (chunk) => {
      result += chunk
    })
    stream.on('end', () => {
      resolve(result)
    })
    stream.on('error', reject)
  })
}

function isPostponedError(error: unknown): error is Postponed {
  return error instanceof Postponed
}

function createAbortControllerForPostponedState() {
  const controller = new AbortController()
  const timer = globalThis.setTimeout(() => {
    controller.abort(new Postponed())
  }, 0)

  return {
    controller,
    clear() {
      globalThis.clearTimeout(timer)
    },
  }
}

async function createAbortedWebPrerender() {
  const deferred = createDeferred<SessionRecord>()
  const abortHandle = createAbortControllerForPostponedState()

  try {
    // prerender waits for data by default, but aborting it yields an opaque postponed state for later continuation.
    const result = await prerender(createPendingDocument('prerender (aborted)', deferred.promise), {
      signal: abortHandle.controller.signal,
      onError(error) {
        if (!isPostponedError(error)) {
          console.error(error)
        }
      },
    })

    const preludeMarkup = await webStreamToString(result.prelude)
    deferred.resolve(demoSession)

    return {
      postponed: result.postponed,
      preludeMarkup,
    }
  } finally {
    abortHandle.clear()
  }
}

async function createAbortedNodePrerender() {
  const deferred = createDeferred<SessionRecord>()
  const abortHandle = createAbortControllerForPostponedState()

  try {
    // prerenderToNodeStream is the Node stream sibling of prerender for static generation flows.
    const result = await prerenderToNodeStream(
      createPendingDocument('prerenderToNodeStream (aborted)', deferred.promise),
      {
        signal: abortHandle.controller.signal,
        onError(error) {
          if (!isPostponedError(error)) {
            console.error(error)
          }
        },
      },
    )

    const preludeMarkup = await nodeStreamToString(result.prelude)
    deferred.resolve(demoSession)

    return {
      postponed: result.postponed,
      preludeMarkup,
    }
  } finally {
    abortHandle.clear()
  }
}

async function runRenderToStringMode() {
  // renderToString returns immediately, so an unresolved Suspense boundary falls back instead of waiting for data.
  return summarizeMarkup(
    renderToString(createPendingDocument('renderToString', createNeverSettlingPromise<SessionRecord>())),
  )
}

async function runRenderToStaticMarkupMode() {
  // renderToStaticMarkup has the same immediate fallback behavior, but strips React's boundary markers from the output.
  return summarizeMarkup(
    renderToStaticMarkup(
      createPendingDocument('renderToStaticMarkup', createNeverSettlingPromise<SessionRecord>()),
    ),
  )
}

async function runRenderToReadableStreamMode() {
  const deferred = createDeferred<SessionRecord>()

  try {
    // renderToReadableStream streams the shell first and keeps filling the response as suspended data resolves.
    const stream = await renderToReadableStream(
      createPendingDocument('renderToReadableStream', deferred.promise),
    )
    const reader = stream.getReader()
    const firstChunk = await reader.read()
    const decoder = new TextDecoder()
    const shellMarkup = firstChunk.done ? '' : decoder.decode(firstChunk.value, { stream: true })
    deferred.resolve(demoSession)
    await stream.allReady
    const remainingMarkup = await webStreamReaderToString(reader)
    return summarizeMarkup(shellMarkup + remainingMarkup)
  } finally {
    deferred.resolve(demoSession)
  }
}

async function runRenderToPipeableStreamMode() {
  const deferred = createDeferred<SessionRecord>()
  const cancelResolution = scheduleSessionResolution(deferred)

  try {
    // renderToPipeableStream is the Node stream variant used by traditional streaming SSR servers.
    const output = new PassThrough()
    const htmlPromise = nodeStreamToString(output)
    const stream = renderToPipeableStream(createPendingDocument('renderToPipeableStream', deferred.promise), {
      onShellReady() {
        stream.pipe(output)
      },
      onShellError(error) {
        output.destroy(error as Error)
      },
    })

    return summarizeMarkup(await htmlPromise)
  } finally {
    cancelResolution()
  }
}

async function runPrerenderMode() {
  // prerender waits for all suspended data and returns a static prelude plus optional postponed state.
  const result = await prerender(createResolvedDocument('prerender'), {})
  const markup = await webStreamToString(result.prelude)

  return {
    capturedPostponedState: result.postponed !== null,
    containsFallback: markup.includes('Preparing streamed session'),
    containsResolvedContent: markup.includes(demoSession.presenter),
  }
}

async function runResumeMode() {
  const abortedPrerender = await createAbortedWebPrerender()

  if (!abortedPrerender.postponed) {
    throw new Error('Expected prerender() to capture postponed state for resume().')
  }

  // resume continues an aborted prerender with Web Streams once the postponed data is available.
  const stream = await resume(createResolvedDocument('resume'), abortedPrerender.postponed, {})
  const resumedMarkup = await webStreamToString(stream)

  return {
    capturedPostponedState: true,
    preludeContainsFallback: abortedPrerender.preludeMarkup.includes('Preparing streamed session'),
    resumedContainsResolvedContent: resumedMarkup.includes(demoSession.presenter),
  }
}

async function runPrerenderToNodeStreamMode() {
  const abortedPrerender = await createAbortedNodePrerender()

  return {
    capturedPostponedState: abortedPrerender.postponed !== null,
    preludeContainsFallback: abortedPrerender.preludeMarkup.includes('Preparing streamed session'),
  }
}

async function runResumeToPipeableStreamMode() {
  const abortedPrerender = await createAbortedNodePrerender()

  if (!abortedPrerender.postponed) {
    throw new Error('Expected prerenderToNodeStream() to capture postponed state for resumeToPipeableStream().')
  }

  // resumeToPipeableStream continues an aborted prerender using Node streams instead of Web Streams.
  const resumed = await resumeToPipeableStream(
    createResolvedDocument('resumeToPipeableStream'),
    abortedPrerender.postponed,
    {},
  )
  const output = new PassThrough()
  const htmlPromise = nodeStreamToString(output)
  resumed.pipe(output)

  return {
    capturedPostponedState: true,
    preludeContainsFallback: abortedPrerender.preludeMarkup.includes('Preparing streamed session'),
    resumedContainsResolvedContent: (await htmlPromise).includes(demoSession.presenter),
  }
}

async function runResumeAndPrerenderMode() {
  const abortedPrerender = await createAbortedWebPrerender()

  if (!abortedPrerender.postponed) {
    throw new Error('Expected prerender() to capture postponed state for resumeAndPrerender().')
  }

  // resumeAndPrerender finishes an aborted prerender as static HTML once the data is ready.
  const result = await resumeAndPrerender(createResolvedDocument('resumeAndPrerender'), abortedPrerender.postponed, {})
  const markup = await webStreamToString(result.prelude)

  return {
    containsFallback: markup.includes('Preparing streamed session'),
    containsResolvedContent: markup.includes(demoSession.presenter),
  }
}

async function runResumeAndPrerenderToNodeStreamMode() {
  const abortedPrerender = await createAbortedNodePrerender()

  if (!abortedPrerender.postponed) {
    throw new Error('Expected prerenderToNodeStream() to capture postponed state for resumeAndPrerenderToNodeStream().')
  }

  // resumeAndPrerenderToNodeStream is the Node stream form of static continuation after an aborted prerender.
  const result = await resumeAndPrerenderToNodeStream(
    createResolvedDocument('resumeAndPrerenderToNodeStream'),
    abortedPrerender.postponed,
    {},
  )
  const markup = await nodeStreamToString(result.prelude)

  return {
    containsFallback: markup.includes('Preparing streamed session'),
    containsResolvedContent: markup.includes(demoSession.presenter),
  }
}

export async function runAllModes(): Promise<StreamingSsrReport> {
  return {
    renderToString: await runRenderToStringMode(),
    renderToStaticMarkup: await runRenderToStaticMarkupMode(),
    renderToReadableStream: await runRenderToReadableStreamMode(),
    renderToPipeableStream: await runRenderToPipeableStreamMode(),
    prerender: await runPrerenderMode(),
    resume: await runResumeMode(),
    prerenderToNodeStream: await runPrerenderToNodeStreamMode(),
    resumeToPipeableStream: await runResumeToPipeableStreamMode(),
    resumeAndPrerender: await runResumeAndPrerenderMode(),
    resumeAndPrerenderToNodeStream: await runResumeAndPrerenderToNodeStreamMode(),
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const report = await runAllModes()
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
}
