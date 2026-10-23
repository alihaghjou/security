/**
 * AI Security Fix Assistant
 * Provides grounded, practical remediation guidance for both Everyday Users and Developers.
 * Strictly uses factual advisory data without hallucinations.
 */

import { EnrichedFinding } from "./vulnerability-intel";

export interface FixGuidance {
  mode: "PERSONAL" | "DEVELOPER";
  overview: string;
  riskExplanation: string;
  recommendedVersion: string;
  isUpgradeRequired: boolean;
  upgradeCommands: string[];
  breakingChangeRisk: "LOW" | "MEDIUM" | "HIGH";
  breakingChangeNotes: string;
  workaroundAlternative: string;
  verificationSteps: string[];
  sourceCitations: Array<{ title: string; url: string }>;
  isLiveAi: boolean;
}

export function generateFixGuidance(
  finding: EnrichedFinding,
  packageName: string,
  currentVersion: string,
  ecosystem: string,
  mode: "PERSONAL" | "DEVELOPER" = "PERSONAL"
): FixGuidance {
  const fixVersion = finding.recommendedFix || "the latest vendor patch";
  const isKev = finding.isKev;
  const isCritical = finding.severity === "CRITICAL";

  // Check breaking change risk (Major version bump)
  let breakingChangeRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let breakingChangeNotes = "The recommended update appears to be a patch or minor release with minimal breaking risk.";

  const currentMajor = parseInt(currentVersion.replace(/^v/i, "").split(".")[0], 10);
  const fixMajor = parseInt(fixVersion.replace(/^v/i, "").split(".")[0], 10);

  if (!isNaN(currentMajor) && !isNaN(fixMajor) && fixMajor > currentMajor) {
    breakingChangeRisk = "HIGH";
    breakingChangeNotes = `Upgrading from major version ${currentMajor} to ${fixMajor} may contain API breaking changes. Review vendor changelog before updating.`;
  }

  // Package manager commands for developers
  const upgradeCommands: string[] = [];
  const ecoLower = ecosystem.toLowerCase();

  if (ecoLower === "npm" || ecoLower === "node") {
    upgradeCommands.push(`npm install ${packageName}@${fixVersion}`);
    upgradeCommands.push(`pnpm add ${packageName}@${fixVersion}`);
    upgradeCommands.push(`yarn add ${packageName}@${fixVersion}`);
  } else if (ecoLower === "pypi" || ecoLower === "python") {
    upgradeCommands.push(`pip install --upgrade "${packageName}==${fixVersion}"`);
  } else if (ecoLower === "crates.io" || ecoLower === "cargo") {
    upgradeCommands.push(`cargo update -p ${packageName} --precise ${fixVersion}`);
  } else if (ecoLower === "go") {
    upgradeCommands.push(`go get ${packageName}@v${fixVersion.replace(/^v/i, "")}`);
  } else {
    upgradeCommands.push(`Update ${packageName} to version ${fixVersion} using your system package manager`);
  }

  // Citations
  const sourceCitations: Array<{ title: string; url: string }> = [
    { title: `OSV Advisory ${finding.advisoryId}`, url: finding.sourceUrl },
  ];
  if (finding.aliases && finding.aliases.length > 0) {
    const cve = finding.aliases.find((a) => a.startsWith("CVE-"));
    if (cve) {
      sourceCitations.push({
        title: `NVD CVE Record (${cve})`,
        url: `https://nvd.nist.gov/vuln/detail/${cve}`,
      });
    }
  }

  if (mode === "PERSONAL") {
    return {
      mode: "PERSONAL",
      overview: `A security vulnerability was found in ${packageName} (${currentVersion}). An official fix is available in version ${fixVersion}.`,
      riskExplanation: isKev
        ? `This issue is known to be actively targeted by cyber attackers. Updating as soon as possible is strongly recommended.`
        : isCritical
        ? `This is a high-severity issue that could allow unauthorized access or software crashes if left unaddressed.`
        : `This vulnerability has low-to-medium risk under normal conditions, but updating keeps your computer secure.`,
      recommendedVersion: fixVersion,
      isUpgradeRequired: isKev || isCritical,
      upgradeCommands: [],
      breakingChangeRisk,
      breakingChangeNotes: "Consumer software updates typically install cleanly without needing manual configuration.",
      workaroundAlternative: "If you cannot update right now, avoid opening untrusted files or connecting to unverified networks with this application.",
      verificationSteps: [
        `Install the official update from the verified software provider.`,
        `Reopen SecureFlow and tap 'I updated this software'.`,
        `Enter your new version (${fixVersion}) to verify you are protected.`,
      ],
      sourceCitations,
      isLiveAi: false,
    };
  }

  // Developer Guidance
  return {
    mode: "DEVELOPER",
    overview: `Advisory ${finding.advisoryId} affects ${packageName}@${currentVersion}. Affected range: ${finding.affectedRange}.`,
    riskExplanation: `Severity: ${finding.severity} (CVSS: ${finding.cvssScore ?? "N/A"}). EPSS exploit probability: ${
      finding.epssScore ? (finding.epssScore * 100).toFixed(1) + "%" : "Minimal"
    }. ${isKev ? "CRITICAL: Listed on CISA Known Exploited Vulnerabilities catalog." : "No active in-the-wild exploitation confirmed."}`,
    recommendedVersion: fixVersion,
    isUpgradeRequired: isKev || isCritical,
    upgradeCommands,
    breakingChangeRisk,
    breakingChangeNotes,
    workaroundAlternative: "Apply strict input validation upstream or isolate the vulnerable module behind a feature flag if immediate upgrade is blocked by dependencies.",
    verificationSteps: [
      `Run the package manager upgrade command in your project directory.`,
      `Commit the updated lockfile.`,
      `Re-run your automated test suite to ensure no breaking API changes occurred.`,
      `Upload your new lockfile to SecureFlow to verify 0 active vulnerabilities.`,
    ],
    sourceCitations,
    isLiveAi: false,
  };
}
