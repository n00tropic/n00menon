/**
 * Shared types for n00menon
 */

export interface ValidationResult {
  file: string;
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  ruleId?: string;
  severity: "error" | "warning";
}

export interface SyncResult {
  source: string;
  target: string;
  synced: boolean;
  changes?: string; // Diff or description of changes
}

export interface FixResult {
  file: string;
  fixed: boolean;
  changes: string[];
}
