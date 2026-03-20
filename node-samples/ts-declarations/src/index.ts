/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./release-audit.d.ts" />
/* eslint-enable @typescript-eslint/triple-slash-reference */

import {
  createReleaseSession,
  declarationSampleVersion,
  type ReleaseConfig,
  type ReleaseRunReport,
} from '../vendor/legacy-release-kit.js'

const auditEnvelope: ReleaseAuditEnvelope = {
  auditStamp: 'AUDIT-204',
  reviewer: 'Mina',
  approvedChannels: ['beta', 'stable'],
}

const config: ReleaseConfig = {
  channel: 'beta',
  owner: 'Platform systems',
  checklist: ['Confirm beta cohort', 'Record fallback plan'],
  observabilityOwner: 'Observability guild',
}

const session = createReleaseSession(config)
session.attachTrace('trace-release-beta')

const report: ReleaseRunReport = session.run('prepare')

export const declarationSampleOutput = [
  `Legacy kit ${declarationSampleVersion}`,
  session.summarize(),
  report.summary,
  `Reviewer ${auditEnvelope.reviewer}`,
  `Trace ${session.traceId ?? 'trace-missing'}`,
].join('\n')

export const declarationSampleSnapshot = {
  auditEnvelope,
  observabilityOwner: config.observabilityOwner,
  checklistCount: report.checklist.length,
} as const
