export const declarationSampleVersion = '0.7.0'

export function createReleaseSession(config) {
  let traceId = undefined

  return {
    config,
    run(stage) {
      const checklist = config.checklist ?? []
      const observabilityStep = config.observabilityOwner
        ? [`Observability owner: ${config.observabilityOwner}`]
        : []

      return {
        stage,
        summary: `${config.owner} scheduled ${stage} for the ${config.channel} channel.`,
        checklist: [...checklist, ...observabilityStep],
      }
    },
    summarize() {
      return `${config.owner} owns the ${config.channel} release lane.`
    },
    attachTrace(nextTraceId) {
      traceId = nextTraceId
    },
    get traceId() {
      return traceId
    },
  }
}
