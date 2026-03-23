import type { ComponentType } from "react";
import ReleaseBranchComparePanel from "./features/release-branch-compare/ReleaseBranchComparePanel";
import ReleaseChangeHistoryPanel from "./features/release-change-history/ReleaseChangeHistoryPanel";
import ReleaseCommunicationHandoffPanel from "./features/release-communication-handoff/ReleaseCommunicationHandoffPanel";
import ReleaseIncidentFaqCurationPanel from "./features/release-incident-faq-curation/ReleaseIncidentFaqCurationPanel";
import ReleaseIncidentCommsApprovalPacksPanel from "./features/release-incident-comms-approval-packs/ReleaseIncidentCommsApprovalPacksPanel";
import ReleaseDelegatedApprovalBundlesPanel from "./features/release-delegated-approval-bundles/ReleaseDelegatedApprovalBundlesPanel";
import ReleaseCustomerPromiseReconciliationPanel from "./features/release-customer-promise-reconciliation/ReleaseCustomerPromiseReconciliationPanel";
import ReleaseEscalationRoutingPanel from "./features/release-escalation-routing/ReleaseEscalationRoutingPanel";
import ReleaseExitReadinessLedgersPanel from "./features/release-exit-readiness-ledgers/ReleaseExitReadinessLedgersPanel";
import ReleaseFieldMergePanel from "./features/release-field-merge/ReleaseFieldMergePanel";
import ReleaseFollowUpCommitmentsPanel from "./features/release-follow-up-commitments/ReleaseFollowUpCommitmentsPanel";
import ReleaseIncidentTimelineReconstructionPanel from "./features/release-incident-timeline-reconstruction/ReleaseIncidentTimelineReconstructionPanel";
import ReleaseRemediationEvidenceBundlesPanel from "./features/release-remediation-evidence-bundles/ReleaseRemediationEvidenceBundlesPanel";
import ReleaseRecoveryCreditLedgersPanel from "./features/release-recovery-credit-ledgers/ReleaseRecoveryCreditLedgersPanel";
import ReleaseRemediationReadinessRegistriesPanel from "./features/release-remediation-readiness-registries/ReleaseRemediationReadinessRegistriesPanel";
import ReleaseRelaunchExceptionRegistersPanel from "./features/release-relaunch-exception-registers/ReleaseRelaunchExceptionRegistersPanel";
import ReleaseLaunchOrchestrationPanel from "./features/release-launch-orchestration/ReleaseLaunchOrchestrationPanel";
import ReleaseMultiRegionRollbackPanel from "./features/release-multi-region-rollback/ReleaseMultiRegionRollbackPanel";
import ReleaseOwnershipTransferAuditPanel from "./features/release-ownership-transfer-audit/ReleaseOwnershipTransferAuditPanel";
import ReleasePostRollbackSegmentationPanel from "./features/release-post-rollback-segmentation/ReleasePostRollbackSegmentationPanel";
import ReleaseRollbackDecisionMatrixPanel from "./features/release-rollback-decision-matrix/ReleaseRollbackDecisionMatrixPanel";
import ReleaseRollbackWaiverLedgersPanel from "./features/release-rollback-waiver-ledgers/ReleaseRollbackWaiverLedgersPanel";
import ReleaseRolloutPauseResumePanel from "./features/release-rollout-pause-resume/ReleaseRolloutPauseResumePanel";
import ReleaseScheduledPublishPanel from "./features/release-scheduled-publish/ReleaseScheduledPublishPanel";
import ReleaseResumptionAttestationRegistersPanel from "./features/release-resumption-attestation-registers/ReleaseResumptionAttestationRegistersPanel";
import ReleaseStabilityAttestationLedgersPanel from "./features/release-stability-attestation-ledgers/ReleaseStabilityAttestationLedgersPanel";
import type { MiniSampleId } from "./sampleCatalog";
import ReleaseHandoffConflictPanel from "./features/release-handoff-conflict/ReleaseHandoffConflictPanel";
import ReleaseIncidentCollaborationPanel from "./features/release-incident-collaboration/ReleaseIncidentCollaborationPanel";
import ReleaseApprovalWorkflowPanel from "./features/release-approval-workflow/ReleaseApprovalWorkflowPanel";
import ReleaseLaunchChecklistPanel from "./features/release-launch-checklist/ReleaseLaunchChecklistPanel";
import ReleaseReadinessPanel from "./features/release-readiness/ReleaseReadinessPanel";
import ReleaseReviewThreadsPanel from "./features/release-review-threads/ReleaseReviewThreadsPanel";
import ReleaseRolloutReconciliationPanel from "./features/release-rollout-reconciliation/ReleaseRolloutReconciliationPanel";
import ReleaseRolloutOptimisticPanel from "./features/release-rollout-optimistic/ReleaseRolloutOptimisticPanel";
import ActivityTransitionSample from "./samples/ActivityTransitionSample";
import AccessibleDialogSample from "./samples/AccessibleDialogSample";
import AccessibleListboxSample from "./samples/AccessibleListboxSample";
import AsyncUiVerificationSample from "./samples/AsyncUiVerificationSample";
import ClassesModelsSample from "./samples/ClassesModelsSample";
import ConditionalDistributivitySample from "./samples/ConditionalDistributivitySample";
import ContextIdentitySample from "./samples/ContextIdentitySample";
import ContextThemeSample from "./samples/ContextThemeSample";
import DebouncedSearchRaceSample from "./samples/DebouncedSearchRaceSample";
import ErrorBoundarySample from "./samples/ErrorBoundarySample";
import FormStatusSample from "./samples/FormStatusSample";
import FunctionsTuplesSample from "./samples/FunctionsTuplesSample";
import KeyIdentitySample from "./samples/KeyIdentitySample";
import LayoutEffectsSample from "./samples/LayoutEffectsSample";
import MappedFilteringSample from "./samples/MappedFilteringSample";
import MemoLabSample from "./samples/MemoLabSample";
import PortalModalSample from "./samples/PortalModalSample";
import PrivateFieldsSample from "./samples/PrivateFieldsSample";
import RecursiveTypesSample from "./samples/RecursiveTypesSample";
import ReducerBoardSample from "./samples/ReducerBoardSample";
import RefTimingSample from "./samples/RefTimingSample";
import StaleClosureSample from "./samples/StaleClosureSample";
import UtilityMappedSample from "./samples/UtilityMappedSample";
import UseResourceSample from "./samples/UseResourceSample";

// The app and the tests share this registry so every implemented sample id points at one concrete component in one place.
export const sampleImplementations: Partial<
  Record<MiniSampleId, ComponentType>
> = {
  // Partial<Record<...>> is deliberate here: the catalog also contains planned and documentation-only
  // entries, so forcing every MiniSampleId to have a component would make the registry lie about what is runnable.
  "sample-react-activity-transition": ActivityTransitionSample,
  "sample-react-accessible-dialog": AccessibleDialogSample,
  "sample-react-accessible-listbox": AccessibleListboxSample,
  "sample-react-async-ui-verification": AsyncUiVerificationSample,
  "sample-react-context-identity": ContextIdentitySample,
  "sample-react-context-theme": ContextThemeSample,
  "sample-react-debounced-search-race": DebouncedSearchRaceSample,
  "sample-react-error-boundary": ErrorBoundarySample,
  "sample-react-form-status": FormStatusSample,
  "sample-react-key-identity": KeyIdentitySample,
  "sample-react-layout-effects": LayoutEffectsSample,
  "sample-react-memo-lab": MemoLabSample,
  "sample-react-portal-modal": PortalModalSample,
  "sample-react-release-branch-compare": ReleaseBranchComparePanel,
  "sample-react-release-change-history": ReleaseChangeHistoryPanel,
  "sample-react-release-communication-handoff":
    ReleaseCommunicationHandoffPanel,
  "sample-react-release-incident-faq-curation": ReleaseIncidentFaqCurationPanel,
  "sample-react-release-incident-comms-approval-packs":
    ReleaseIncidentCommsApprovalPacksPanel,
  "sample-react-release-delegated-approval-bundles":
    ReleaseDelegatedApprovalBundlesPanel,
  "sample-react-release-customer-promise-reconciliation":
    ReleaseCustomerPromiseReconciliationPanel,
  "sample-react-release-escalation-routing": ReleaseEscalationRoutingPanel,
  "sample-react-release-exit-readiness-ledgers":
    ReleaseExitReadinessLedgersPanel,
  "sample-react-release-field-merge": ReleaseFieldMergePanel,
  "sample-react-release-follow-up-commitments": ReleaseFollowUpCommitmentsPanel,
  "sample-react-release-handoff-conflict": ReleaseHandoffConflictPanel,
  "sample-react-release-incident-timeline-reconstruction":
    ReleaseIncidentTimelineReconstructionPanel,
  "sample-react-release-remediation-evidence-bundles":
    ReleaseRemediationEvidenceBundlesPanel,
  "sample-react-release-incident-collaboration":
    ReleaseIncidentCollaborationPanel,
  "sample-react-release-approval-workflow": ReleaseApprovalWorkflowPanel,
  "sample-react-release-launch-checklist": ReleaseLaunchChecklistPanel,
  "sample-react-release-launch-orchestration": ReleaseLaunchOrchestrationPanel,
  "sample-react-release-multi-region-rollback": ReleaseMultiRegionRollbackPanel,
  "sample-react-release-ownership-transfer-audit":
    ReleaseOwnershipTransferAuditPanel,
  "sample-react-release-post-rollback-segmentation":
    ReleasePostRollbackSegmentationPanel,
  "sample-react-release-readiness-feature": ReleaseReadinessPanel,
  "sample-react-release-recovery-credit-ledgers":
    ReleaseRecoveryCreditLedgersPanel,
  "sample-react-release-remediation-readiness-registries":
    ReleaseRemediationReadinessRegistriesPanel,
  "sample-react-release-relaunch-exception-registers":
    ReleaseRelaunchExceptionRegistersPanel,
  "sample-react-release-rollback-decision-matrix":
    ReleaseRollbackDecisionMatrixPanel,
  "sample-react-release-rollback-waiver-ledgers":
    ReleaseRollbackWaiverLedgersPanel,
  "sample-react-release-review-threads": ReleaseReviewThreadsPanel,
  "sample-react-release-resumption-attestation-registers":
    ReleaseResumptionAttestationRegistersPanel,
  "sample-react-release-rollout-pause-resume": ReleaseRolloutPauseResumePanel,
  "sample-react-release-scheduled-publish": ReleaseScheduledPublishPanel,
  "sample-react-release-stability-attestation-ledgers":
    ReleaseStabilityAttestationLedgersPanel,
  "sample-react-release-rollout-reconciliation":
    ReleaseRolloutReconciliationPanel,
  "sample-react-release-rollout-optimistic": ReleaseRolloutOptimisticPanel,
  "sample-react-reducer-board": ReducerBoardSample,
  "sample-react-ref-timing": RefTimingSample,
  "sample-react-stale-closure": StaleClosureSample,
  "sample-react-use-resource": UseResourceSample,
  "sample-ts-private-fields": PrivateFieldsSample,
  "sample-ts-recursive-types": RecursiveTypesSample,
  "sample-ts-classes-models": ClassesModelsSample,
  "sample-ts-conditional-distributivity": ConditionalDistributivitySample,
  "sample-ts-functions-tuples": FunctionsTuplesSample,
  "sample-ts-mapped-filtering": MappedFilteringSample,
  "sample-ts-utility-mapped": UtilityMappedSample,
};
