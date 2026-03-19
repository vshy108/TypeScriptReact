import { useEffect, useState, type ComponentType } from 'react'
import {
  miniSampleCatalog,
  sampleStatusMeta,
  sampleSurfaceLabels,
  type MiniSampleId,
} from '../sampleCatalog'
import { getDefaultSampleId, readSampleIdFromHash, toSampleHash } from '../sampleRuntime'
import ContextThemeSample from '../samples/ContextThemeSample'
import FormStatusSample from '../samples/FormStatusSample'
import LayoutEffectsSample from '../samples/LayoutEffectsSample'
import MemoLabSample from '../samples/MemoLabSample'
import PortalModalSample from '../samples/PortalModalSample'
import ReducerBoardSample from '../samples/ReducerBoardSample'

const sampleImplementations: Partial<Record<MiniSampleId, ComponentType>> = {
  'sample-react-context-theme': ContextThemeSample,
  'sample-react-form-status': FormStatusSample,
  'sample-react-layout-effects': LayoutEffectsSample,
  'sample-react-memo-lab': MemoLabSample,
  'sample-react-portal-modal': PortalModalSample,
  'sample-react-reducer-board': ReducerBoardSample,
}

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
      ) : (
        <div className="empty-state">
          <strong>Implementation slot reserved.</strong>
          <p>{activeSample.whyIsolated}</p>
        </div>
      )}
    </section>
  )
}
