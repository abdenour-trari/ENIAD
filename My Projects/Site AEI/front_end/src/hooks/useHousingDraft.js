// src/hooks/useHousingDraft.js
import { useContext } from "react";
import { HousingContext } from "../context/HousingContext";

export function useHousingDraft() {
  const context = useContext(HousingContext);
  if (!context) {
    throw new Error("useHousingDraft must be used within a HousingProvider");
  }
  return context;
}
