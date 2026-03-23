import { useEffect, useState } from 'react'
import {
  miniSampleCatalog,
  sampleStatusMeta,
  sampleSurfaceLabels,
  type MiniSampleId,
} from '../sampleCatalog'
import { implementedSampleArtifacts } from '../implementedSampleArtifacts'
import { sampleImplementations } from '../sampleImplementations'
import { getDefaultSampleId, readSampleIdFromHash, toSampleHash } from '../sampleRuntime'

function readInitialSampleId(): MiniSampleId {
  return readSampleIdFromHash() ?? getDefaultSampleId()
}

export default function MiniSampleStage() {
  const [activeSampleId, setActiveSampleId] = useState<MiniSampleId>(readInitialSampleId)

  // Listen for browser hashchange events so forward/back navigation and
  // command palette selections update the active sample in real time.
  // Cleanup removes the listener to avoid leaks when the component unmounts.
  useEffect(() => {
    function syncFromHash() {
      setActiveSampleId(readSampleIdFromHash() ?? getDefaultSampleId())
    }

    // Run once immediately because the initial URL hash may already point at a sample before
    // React mounts; only listening for future hashchange events would miss that first state.
    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)

    return () => {
      window.removeEventListener('hashchange', syncFromHash)
    }
  }, [])

  const activeSample =
    miniSampleCatalog.find((sample) => sample.id === activeSampleId) ?? miniSampleCatalog[0]
  const SampleImplementation = sampleImplementations[activeSample.id]
  const implementedArtifact = implementedSampleArtifacts[activeSample.id]
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
      ) : activeSample.status === 'implemented' && implementedArtifact ? (
        <div className="sample-card external-sample">
          <strong>Implemented on a different sample surface.</strong>
          <p>{activeSample.whyIsolated}</p>

          <div className="sample-card__meta">
            <span>{implementedArtifact.label}</span>
            <span>{implementedArtifact.rootDir}</span>
          </div>

          <div className="external-sample__details">
            {implementedArtifact.entryHtml ? (
              <p>
                <span>HTML entry</span>
                <code>{implementedArtifact.entryHtml}</code>
              </p>
            ) : null}
            <p>
              <span>Entry point</span>
              <code>{implementedArtifact.entryPoint}</code>
            </p>
            {implementedArtifact.readmePath ? (
              <p>
                <span>Workspace guide</span>
                <code>{implementedArtifact.readmePath}</code>
              </p>
            ) : null}
            {implementedArtifact.launchPath ? (
              <p>
                <span>Open in dev</span>
                <code>{implementedArtifact.launchPath}</code>
              </p>
            ) : null}
            <p>
              <span>Verify with</span>
              <code>{implementedArtifact.verificationCommand}</code>
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
