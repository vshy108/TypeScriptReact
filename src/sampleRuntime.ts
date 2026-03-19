import { miniSampleCatalog, type MiniSampleId } from './sampleCatalog'

const sampleHashPrefix = '#/samples/'

function toSampleSlug(id: MiniSampleId) {
  return id.replace(/^sample-/, '')
}

export function toSampleHash(id: MiniSampleId) {
  return `${sampleHashPrefix}${toSampleSlug(id)}`
}

export function readSampleIdFromHash(hash = window.location.hash): MiniSampleId | null {
  if (!hash.startsWith(sampleHashPrefix)) {
    return null
  }

  const slug = hash.slice(sampleHashPrefix.length)
  const sample = miniSampleCatalog.find((entry) => toSampleSlug(entry.id) === slug)

  return sample?.id ?? null
}

export function getDefaultSampleId(): MiniSampleId {
  const implementedRouteSample = miniSampleCatalog.find(
    (sample) => sample.surface === 'isolated-route' && sample.status === 'implemented',
  )

  return implementedRouteSample?.id ?? 'sample-core-lab'
}
