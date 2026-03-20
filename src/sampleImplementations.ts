import type { ComponentType } from "react";
import type { MiniSampleId } from "./sampleCatalog";
import ActivityTransitionSample from "./samples/ActivityTransitionSample";
import ClassesModelsSample from "./samples/ClassesModelsSample";
import ContextIdentitySample from "./samples/ContextIdentitySample";
import ContextThemeSample from "./samples/ContextThemeSample";
import ErrorBoundarySample from "./samples/ErrorBoundarySample";
import FormStatusSample from "./samples/FormStatusSample";
import FunctionsTuplesSample from "./samples/FunctionsTuplesSample";
import KeyIdentitySample from "./samples/KeyIdentitySample";
import LayoutEffectsSample from "./samples/LayoutEffectsSample";
import MemoLabSample from "./samples/MemoLabSample";
import PortalModalSample from "./samples/PortalModalSample";
import RecursiveTypesSample from "./samples/RecursiveTypesSample";
import ReducerBoardSample from "./samples/ReducerBoardSample";
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
  "sample-react-stale-closure": StaleClosureSample,
  "sample-react-use-resource": UseResourceSample,
  "sample-ts-recursive-types": RecursiveTypesSample,
  "sample-ts-classes-models": ClassesModelsSample,
  "sample-ts-functions-tuples": FunctionsTuplesSample,
  "sample-ts-utility-mapped": UtilityMappedSample,
};
