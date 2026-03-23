export type ReleaseCustomerPromiseRunId = `customer-promise-run-${number}`;
export type ReleaseCustomerPromiseId = `customer-promise-${number}`;
export type ReleaseCustomerClaimId = `customer-claim-${number}`;
export type ReleaseCustomerPromiseAuditEventId =
  `customer-promise-audit-${number}`;

export interface ReleaseCustomerPromiseRun {
  readonly id: ReleaseCustomerPromiseRunId;
  readonly title: string;
  readonly summary: string;
  readonly stage:
    | "draft"
    | "promise-review"
    | "stale-claim-review"
    | "approver-signoff"
    | "ready-to-publish"
    | "published";
  readonly activePromiseId: ReleaseCustomerPromiseId | null;
  readonly publishBlockedReason: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseCustomerPromise {
  readonly id: ReleaseCustomerPromiseId;
  readonly label: string;
  readonly owner: string;
  readonly audience: string;
  readonly status: "queued" | "awaiting-review" | "approved" | "published";
  readonly note: string;
}

export interface ReleaseCustomerClaim {
  readonly id: ReleaseCustomerClaimId;
  readonly promise: string;
  readonly staleClaim: string;
  readonly revisedClaim: string;
  readonly reason: string;
  readonly status: "current" | "stale" | "invalidated" | "approved";
}

export interface ReleaseCustomerPromiseAuditEvent {
  readonly id: ReleaseCustomerPromiseAuditEventId;
  readonly actor: string;
  readonly action:
    | "initiated"
    | "approved"
    | "invalidated"
    | "signed-off"
    | "published";
  readonly detail: string;
  readonly timestamp: string;
}

export interface ReleaseCustomerPromiseWorkspaceResponse {
  readonly refreshedAt: string;
  readonly run: ReleaseCustomerPromiseRun;
  readonly promises: readonly ReleaseCustomerPromise[];
  readonly claims: readonly ReleaseCustomerClaim[];
  readonly auditEvents: readonly ReleaseCustomerPromiseAuditEvent[];
}

export interface StartReleaseCustomerPromiseInput {
  readonly runId: ReleaseCustomerPromiseRunId;
}

export interface ApproveReleaseCustomerPromiseInput {
  readonly promiseId: ReleaseCustomerPromiseId;
}

export interface InvalidateReleaseCustomerClaimsInput {
  readonly runId: ReleaseCustomerPromiseRunId;
}

export interface SignOffReleaseCustomerPromisesInput {
  readonly runId: ReleaseCustomerPromiseRunId;
}

export interface PublishReleaseCustomerPromisesInput {
  readonly runId: ReleaseCustomerPromiseRunId;
}
