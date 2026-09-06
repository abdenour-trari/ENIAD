import { useContext } from "react";
import { ProjectDraftContext } from "../context/ProjectDraftContext";

export function useProjectDraft() {
  const context = useContext(ProjectDraftContext);
  if (!context) {
    throw new Error("useProjectDraft must be used within a ProjectDraftProvider");
  }
  return context;
}
