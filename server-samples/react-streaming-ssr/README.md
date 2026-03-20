# React Streaming SSR Sample

This workspace demonstrates the current stable React server and static rendering APIs in one place:

- `renderToString`
- `renderToStaticMarkup`
- `renderToReadableStream`
- `renderToPipeableStream`
- `prerender`
- `resume`
- `resumeToPipeableStream`
- `prerenderToNodeStream`
- `resumeAndPrerender`
- `resumeAndPrerenderToNodeStream`

It uses one Suspense-driven document so you can compare how each API handles unresolved data:

- string rendering falls back immediately
- streaming rendering sends the shell first and the resolved content later
- static prerendering waits for data, or can be aborted and resumed later with postponed state

Validate the runtime sample with:

```sh
node ./node_modules/typescript/bin/tsc -p server-samples/react-streaming-ssr/tsconfig.runtime.json
node server-samples/react-streaming-ssr/dist/runAllModes.js
```

