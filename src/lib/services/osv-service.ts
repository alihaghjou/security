/**
 * OSV (Open Source Vulnerabilities) API Integration Service
 * Authoritative source: https://google.github.io/osv.dev/api/
 * API Base: https://api.osv.dev
 */

export interface OSVPackage {
  name: string;
  ecosystem: string;
  purl?: string;
}

export interface OSVEvent {
  introduced?: string;
  fixed?: string;
  last_affected?: string;
  limit?: string;
}

export interface OSVRange {
  type: "SEMVER" | "ECOSYSTEM" | "GIT";
  repo?: string;
  events: OSVEvent[];
}

export interface OSVAffected {
  package: OSVPackage;
  ranges?: OSVRange[];
  versions?: string[];
  ecosystem_specific?: Record<string, unknown>;
  database_specific?: Record<string, unknown>;
}

export interface OSVAdvisory {
  id: string;
  summary?: string;
  details?: string;
  aliases?: string[];
  modified?: string;
  published?: string;
  withdrawn?: string;
  references?: Array<{ type: string; url: string }>;
  affected?: OSVAffected[];
  schema_version?: string;
  severity?: Array<{ type: string; score: string }>;
}

export interface OSVQueryPayload {
  version?: string;
  package?: {
    name: string;
    ecosystem: string;
    purl?: string;
  };
  commit?: string;
}

export interface OSVBatchQueryResponse {
  results: Array<{
    vulns?: OSVAdvisory[];
  }>;
}

const OSV_API_BASE = "https://api.osv.dev/v1";

/**
 * Query OSV for vulnerabilities affecting a single package and optional version.
 */
export async function queryOSV(
  packageName: string,
  ecosystem: string,
  version?: string
): Promise<{ vulns: OSVAdvisory[]; source: string; queriedAt: string }> {
  const payload: OSVQueryPayload = {
    package: {
      name: packageName.trim(),
      ecosystem: normalizeEcosystem(ecosystem),
    },
  };

  if (version && version.trim() !== "" && version.toLowerCase() !== "unknown") {
    payload.version = version.trim();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${OSV_API_BASE}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OSV API HTTP ${res.status}: ${errText || res.statusText}`);
    }

    const data = await res.json();
    return {
      vulns: data.vulns || [],
      source: "OSV.dev",
      queriedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Batch query OSV for multiple packages and versions.
 */
export async function queryOSVBatch(
  items: Array<{ name: string; ecosystem: string; version?: string }>
): Promise<Array<{ item: { name: string; ecosystem: string; version?: string }; vulns: OSVAdvisory[] }>> {
  if (items.length === 0) return [];

  // Batch query in chunks of 500 max as recommended by OSV
  const chunkSize = 200;
  const results: Array<{ item: { name: string; ecosystem: string; version?: string }; vulns: OSVAdvisory[] }> = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const queries = chunk.map((c) => ({
      package: {
        name: c.name.trim(),
        ecosystem: normalizeEcosystem(c.ecosystem),
      },
      ...(c.version && c.version !== "unknown" ? { version: c.version } : {}),
    }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(`${OSV_API_BASE}/querybatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`OSV Batch HTTP ${res.status}: ${res.statusText}`);
      }

      const data: OSVBatchQueryResponse = await res.json();
      chunk.forEach((item, idx) => {
        results.push({
          item,
          vulns: data.results?.[idx]?.vulns || [],
        });
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return results;
}

/**
 * Fetch a specific vulnerability advisory by its OSV, GHSA, or CVE ID.
 */
export async function getOSVVulnerability(id: string): Promise<OSVAdvisory | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${OSV_API_BASE}/vulns/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`OSV API HTTP ${res.status}`);

    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Normalize ecosystem naming for OSV API.
 */
export function normalizeEcosystem(eco: string): string {
  const lower = eco.toLowerCase();
  if (lower === "npm" || lower === "node" || lower === "javascript") return "npm";
  if (lower === "pypi" || lower === "python") return "PyPI";
  if (lower === "go" || lower === "golang") return "Go";
  if (lower === "cargo" || lower === "rust" || lower === "crates.io") return "crates.io";
  if (lower === "maven" || lower === "java") return "Maven";
  if (lower === "nuget" || lower === "dotnet" || lower === "c#") return "NuGet";
  if (lower === "packagist" || lower === "composer" || lower === "php") return "Packagist";
  if (lower === "rubygems" || lower === "ruby" || lower === "gem") return "RubyGems";
  if (lower === "hex" || lower === "elixir") return "Hex";
  return eco;
}

/**
 * Extract fixed versions from an advisory's affected records.
 */
export function extractFixedVersions(advisory: OSVAdvisory, packageName?: string): string[] {
  const fixedVersions = new Set<string>();
  const affectedList = advisory.affected || [];

  for (const aff of affectedList) {
    if (packageName && aff.package?.name?.toLowerCase() !== packageName.toLowerCase()) {
      continue;
    }
    for (const range of aff.ranges || []) {
      for (const event of range.events || []) {
        if (event.fixed) {
          fixedVersions.add(event.fixed);
        }
      }
    }
  }

  return Array.from(fixedVersions);
}

/**
 * Format affected version range into a human-readable string.
 */
export function formatAffectedRange(advisory: OSVAdvisory, packageName?: string): string {
  const ranges: string[] = [];
  const affectedList = advisory.affected || [];

  for (const aff of affectedList) {
    if (packageName && aff.package?.name?.toLowerCase() !== packageName.toLowerCase()) {
      continue;
    }

    if (aff.ranges) {
      for (const r of aff.ranges) {
        let introduced: string | null = null;
        let fixed: string | null = null;
        let lastAffected: string | null = null;

        for (const ev of r.events) {
          if (ev.introduced) introduced = ev.introduced;
          if (ev.fixed) fixed = ev.fixed;
          if (ev.last_affected) lastAffected = ev.last_affected;
        }

        if (introduced && fixed) {
          ranges.push(`>= ${introduced}, < ${fixed}`);
        } else if (fixed) {
          ranges.push(`< ${fixed}`);
        } else if (introduced && lastAffected) {
          ranges.push(`>= ${introduced}, <= ${lastAffected}`);
        } else if (introduced) {
          ranges.push(`>= ${introduced}`);
        }
      }
    }

    if (ranges.length === 0 && aff.versions && aff.versions.length > 0) {
      if (aff.versions.length <= 3) {
        ranges.push(aff.versions.join(", "));
      } else {
        ranges.push(`${aff.versions[0]} ... ${aff.versions[aff.versions.length - 1]} (${aff.versions.length} versions)`);
      }
    }
  }

  return ranges.length > 0 ? ranges.join(" | ") : "Unspecified range";
}
