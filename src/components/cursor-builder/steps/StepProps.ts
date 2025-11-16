import type { CursorBuilderFormState } from "@/types/cursor-builder";

export interface StepProps {
  formState: CursorBuilderFormState;
  updateField: <K extends keyof CursorBuilderFormState>(
    field: K,
    value: CursorBuilderFormState[K]
  ) => void;
  updateArrayField: <K extends keyof CursorBuilderFormState>(
    field: K,
    value: string,
    action: "add" | "remove" | "toggle"
  ) => void;
}

