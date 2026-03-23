import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchReleaseBranchWorkspace,
  isReleaseBranchAbortError,
  promoteReleaseBranch,
  selectReleaseBranch,
} from "./client";
import type { ReleaseBranchRecord } from "./types";

type RequestStatus = "loading" | "ready" | "error";
type MutationStatus = "idle" | "working" | "saved" | "error";

export function useReleaseBranchCompare() {
  const [branches, setBranches] = useState<readonly ReleaseBranchRecord[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<
    ReleaseBranchRecord["id"] | null
  >(null);
  const [status, setStatus] = useState<RequestStatus>("loading");
  const [mutationStatus, setMutationStatus] = useState<MutationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetchReleaseBranchWorkspace(controller.signal)
      .then((workspace) => {
        setBranches(workspace.branches);
        setActiveBranchId(workspace.activeBranchId);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (isReleaseBranchAbortError(error)) {
          return;
        }

        setStatus("error");
        setMessage("Could not load the branch compare workspace.");
      });

    return () => {
      controller.abort();
    };
  }, []);

  const activeBranch = useMemo(
    () => branches.find((branch) => branch.id === activeBranchId) ?? null,
    [activeBranchId, branches],
  );
  const primaryBranch = useMemo(
    () => branches.find((branch) => branch.kind === "primary") ?? null,
    [branches],
  );
  const alternateBranches = useMemo(
    () => branches.filter((branch) => branch.id !== activeBranchId),
    [activeBranchId, branches],
  );

  const selectBranch = useCallback((branchId: ReleaseBranchRecord["id"]) => {
    setMutationStatus("working");
    setMessage(null);

    void selectReleaseBranch(branchId)
      .then((workspace) => {
        setBranches(workspace.branches);
        setActiveBranchId(workspace.activeBranchId);
        setMutationStatus("saved");
        const selectedBranch = workspace.branches.find(
          (branch) => branch.id === branchId,
        );
        setMessage(
          `Comparing ${selectedBranch?.name ?? "selected branch"} against the current primary branch.`,
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Could not switch the compare view.");
      });
  }, []);

  const promoteBranch = useCallback(() => {
    if (!activeBranch) {
      return;
    }

    setMutationStatus("working");
    setMessage(null);

    void promoteReleaseBranch({ branchId: activeBranch.id })
      .then((workspace) => {
        setBranches(workspace.branches);
        setActiveBranchId(workspace.activeBranchId);
        setMutationStatus("saved");
        const selectedBranch = workspace.branches.find(
          (branch) => branch.id === workspace.activeBranchId,
        );
        setMessage(
          `Promoted ${selectedBranch?.name ?? "selected branch"} to the new primary release draft.`,
        );
      })
      .catch(() => {
        setMutationStatus("error");
        setMessage("Could not promote the selected branch.");
      });
  }, [activeBranch]);

  const compareRows = useMemo(() => {
    if (!activeBranch || !primaryBranch) {
      return [];
    }

    return [
      {
        label: "Headline",
        primaryValue: primaryBranch.headline,
        activeValue: activeBranch.headline,
        differs: primaryBranch.headline !== activeBranch.headline,
      },
      {
        label: "Summary",
        primaryValue: primaryBranch.summary,
        activeValue: activeBranch.summary,
        differs: primaryBranch.summary !== activeBranch.summary,
      },
    ];
  }, [activeBranch, primaryBranch]);

  return {
    activeBranch,
    alternateBranches,
    branches,
    compareRows,
    message,
    mutationStatus,
    primaryBranch,
    promoteBranch,
    selectBranch,
    status,
  };
}
