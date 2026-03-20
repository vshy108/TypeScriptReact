// Declaration files and package typing
// -------------------------------------
// This sample demonstrates how to type an untyped JavaScript module using
// hand-authored .d.ts files, triple-slash references, and module augmentation.
// The vendor/ directory contains a plain JS library; the companion .d.ts file
// provides the type surface that TypeScript uses for import checking.

// A triple-slash reference tells the compiler to include additional type definitions
// before checking this file. Here it pulls in release-audit.d.ts which declares
// the global ReleaseAuditEnvelope interface (module augmentation example).
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./release-audit.d.ts" />
/* eslint-enable @typescript-eslint/triple-slash-reference */

// The vendor JS file has no types of its own. The .d.ts file at
// vendor/legacy-release-kit.d.ts provides the type declarations that make
// this import fully type-safe without modifying the original JS source.
import {
  createReleaseSession,
  declarationSampleVersion,
  type ReleaseConfig,
  type ReleaseRunReport,
} from '../vendor/legacy-release-kit.js'

// ReleaseAuditEnvelope is declared in release-audit.d.ts as a global interface.
// This shows declaration merging: the type is visible here without an import.
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
