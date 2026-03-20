import type { ComponentType } from "react";
import type { MiniSampleId } from "./sampleCatalog";
import ActivityTransitionSample from "./samples/ActivityTransitionSample";
import ClassesModelsSample from "./samples/ClassesModelsSample";
import ConditionalDistributivitySample from "./samples/ConditionalDistributivitySample";
import ContextIdentitySample from "./samples/ContextIdentitySample";
import ContextThemeSample from "./samples/ContextThemeSample";
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
  "sample-react-activity-transition": ActivityTransitionSample,
  "sample-react-context-identity": ContextIdentitySample,
  "sample-react-context-theme": ContextThemeSample,
  "sample-react-error-boundary": ErrorBoundarySample,
  "sample-react-form-status": FormStatusSample,
  "sample-react-key-identity": KeyIdentitySample,
  "sample-react-layout-effects": LayoutEffectsSample,
  "sample-react-memo-lab": MemoLabSample,
  "sample-react-portal-modal": PortalModalSample,
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
