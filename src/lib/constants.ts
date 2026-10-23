// =============================================================================
// SecureFlow - Constants & Configuration
// =============================================================================

export const APP_NAME = "SecureFlow" as const;
export const APP_TAGLINE = "Know what's vulnerable. Know what to update. Know how to fix it." as const;
export const APP_DESCRIPTION = "Peace of mind through smarter software security. Self-service vulnerability assistant for personal software and developer projects." as const;

export const SUPPORTED_ECOSYSTEMS = [
  { id: "General", label: "General / Desktop / OS", icon: "Laptop" },
  { id: "npm", label: "npm (Node.js & JavaScript)", icon: "FileCode" },
  { id: "PyPI", label: "PyPI (Python)", icon: "FileCode2" },
  { id: "crates.io", label: "crates.io (Rust)", icon: "Box" },
  { id: "Go", label: "Go Modules", icon: "Code" },
  { id: "Maven", label: "Maven (Java)", icon: "Coffee" },
] as const;

export const PRIORITY_CONFIG = {
  FIX_URGENTLY: {
    label: "Fix Urgently",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    description: "Strong evidence of critical risk or active exploitation requiring prompt attention.",
  },
  UPDATE_RECOMMENDED: {
    label: "Update Recommended",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    description: "An applicable vulnerability or important security patch is available to apply.",
  },
  MONITOR: {
    label: "Monitor",
    color: "text-slate-300",
    bg: "bg-slate-800/40",
    border: "border-slate-700/40",
    description: "Known issue without evidence requiring immediate action under current context.",
  },
  NEEDS_VERIFICATION: {
    label: "Needs Verification",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    description: "The software version or applicability is uncertain and requires verification.",
  },
} as const;
