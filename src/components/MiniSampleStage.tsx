import { useEffect, useState } from 'react'
import {
  miniSampleCatalog,
  sampleStatusMeta,
  sampleSurfaceLabels,
  type MiniSampleId,
} from '../sampleCatalog'
import { externalSampleArtifacts } from '../externalSampleArtifacts'
import { sampleImplementations } from '../sampleImplementations'
import { getDefaultSampleId, readSampleIdFromHash, toSampleHash } from '../sampleRuntime'

function readInitialSampleId(): MiniSampleId {
  return readSampleIdFromHash() ?? getDefaultSampleId()
}

export default function MiniSampleStage() {
  const [activeSampleId, setActiveSampleId] = useState<MiniSampleId>(readInitialSampleId)

  useEffect(() => {
    function syncFromHash() {
      setActiveSampleId(readSampleIdFromHash() ?? getDefaultSampleId())
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)

    return () => {
      window.removeEventListener('hashchange', syncFromHash)
    }
  }, [])

  const activeSample =
    miniSampleCatalog.find((sample) => sample.id === activeSampleId) ?? miniSampleCatalog[0]
  const SampleImplementation = sampleImplementations[activeSample.id]
  const externalArtifact = externalSampleArtifacts[activeSample.id]
  const statusMeta = sampleStatusMeta[activeSample.status]

  return (
    <section id="sample-stage" className="surface surface--compact">
      <div className="section-heading">
        <p className="eyebrow">Sample stage</p>
        <h2>{activeSample.title}</h2>
      </div>

      <div className="sample-stage__meta">
        <span className="chip">{activeSample.topic}</span>
        <span className="chip">{sampleSurfaceLabels[activeSample.surface]}</span>
        <span className="chip">{statusMeta.label}</span>
        <code>{toSampleHash(activeSample.id)}</code>
      </div>

      <p className="section-copy">{activeSample.summary}</p>

      {SampleImplementation ? (
        <SampleImplementation />
      ) : activeSample.status === 'implemented' && externalArtifact ? (
        <div className="sample-card external-sample">
          <strong>Implemented outside the current app surface.</strong>
          <p>{activeSample.whyIsolated}</p>

          <div className="sample-card__meta">
            <span>{externalArtifact.label}</span>
            <span>{externalArtifact.rootDir}</span>
          </div>

          <div className="external-sample__details">
            <p>
              <span>Entry point</span>
              <code>{externalArtifact.entryPoint}</code>
            </p>
            <p>
              <span>Verify with</span>
              <code>{externalArtifact.verificationCommand}</code>
            </p>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <strong>Implementation slot reserved.</strong>
          <p>{activeSample.whyIsolated}</p>
        </div>
      )}
    </section>
  )
}
