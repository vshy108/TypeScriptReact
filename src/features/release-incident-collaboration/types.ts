export type ReleaseIncidentId = `incident-${number}`;
export type CollaboratorId = `collaborator-${number}`;

export interface ReleaseCollaboratorPresence {
  readonly id: CollaboratorId;
  readonly name: string;
  readonly role: string;
  readonly status: "editing" | "reviewing" | "watching";
  readonly lastSeen: string;
}

export interface ReleaseIncidentRecord {
  readonly id: ReleaseIncidentId;
  readonly title: string;
  readonly audience: string;
  readonly summary: string;
  readonly revision: number;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface ReleaseIncidentWorkspaceResponse {
  readonly polledAt: string;
  readonly record: ReleaseIncidentRecord;
  readonly collaborators: readonly ReleaseCollaboratorPresence[];
}

export interface SaveReleaseIncidentInput {
  readonly incidentId: ReleaseIncidentId;
  readonly summary: string;
  readonly expectedRevision: number;
}

export interface SaveReleaseIncidentSuccess {
  readonly savedAt: string;
  readonly record: ReleaseIncidentRecord;
  readonly collaborators: readonly ReleaseCollaboratorPresence[];
}

export interface ReleaseIncidentConflictErrorShape {
  readonly code: "conflict" | "summary-too-short";
  readonly message: string;
  readonly latestRecord?: ReleaseIncidentRecord;
  readonly latestCollaborators?: readonly ReleaseCollaboratorPresence[];
}
