/**
 * Safe Dependency Lockfile Parser
 * Strictly parses uploaded dependency inventories in-memory without code execution.
 * Enforces file size limits and safe schema decoding.
 */

export interface ParsedDependency {
  name: string;
  version: string;
  isDirect: boolean;
  ecosystem: "npm" | "PyPI" | "Go" | "crates.io";
}

export interface ParseResult {
  dependencies: ParsedDependency[];
  detectedEcosystem: string;
  filename: string;
  totalParsed: number;
  warnings: string[];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function parseDependencyFile(filename: string, content: string): ParseResult {
  if (content.length > MAX_FILE_SIZE) {
    throw new Error(`File exceeds maximum allowed size of 5 MB (${Math.round(content.length / 1024)} KB)`);
  }

  const lowerName = filename.toLowerCase();

  if (lowerName.endsWith("package-lock.json") || lowerName.endsWith("npm-shrinkwrap.json")) {
    return parsePackageLock(filename, content);
  }

  if (lowerName.endsWith("requirements.txt")) {
    return parseRequirementsTxt(filename, content);
  }

  if (lowerName.endsWith("pnpm-lock.yaml")) {
    return parsePnpmLock(filename, content);
  }

  throw new Error(
    `Unsupported file format: ${filename}. Supported formats are package-lock.json, requirements.txt, and pnpm-lock.yaml.`
  );
}

/**
 * Parse npm package-lock.json (Supports formats v1, v2, and v3)
 */
function parsePackageLock(filename: string, content: string): ParseResult {
  let json: any;
  try {
    json = JSON.parse(content);
  } catch (err: any) {
    throw new Error(`Invalid JSON in ${filename}: ${err.message}`);
  }

  const dependencies: ParsedDependency[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();

  // Check v2/v3 packages map
  if (json.packages && typeof json.packages === "object") {
    const rootDependencies = new Set<string>([
      ...Object.keys(json.packages[""]?.dependencies || {}),
      ...Object.keys(json.packages[""]?.devDependencies || {}),
    ]);

    for (const [key, pkg] of Object.entries(json.packages) as [string, any][]) {
      if (!key || key === "") continue; // skip root project entry
      if (!pkg || typeof pkg !== "object" || !pkg.version) continue;

      // Clean path like "node_modules/lodash" -> "lodash"
      const name = key.replace(/^.*node_modules\//, "");
      const version = String(pkg.version).trim();
      const isDirect = rootDependencies.has(name);
      const dedupeKey = `${name}@${version}`;

      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        dependencies.push({
          name,
          version,
          isDirect,
          ecosystem: "npm",
        });
      }
    }
  } else if (json.dependencies && typeof json.dependencies === "object") {
    // Fallback to v1 dependencies tree
    function traverse(depsObj: Record<string, any>, isRoot: boolean) {
      for (const [name, info] of Object.entries(depsObj)) {
        if (!info || typeof info !== "object" || !info.version) continue;
        const version = String(info.version).trim();
        const dedupeKey = `${name}@${version}`;

        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          dependencies.push({
            name,
            version,
            isDirect: isRoot,
            ecosystem: "npm",
          });
        }

        if (info.dependencies && typeof info.dependencies === "object") {
          traverse(info.dependencies, false);
        }
      }
    }

    traverse(json.dependencies, true);
  } else {
    warnings.push("No dependencies or packages block found in package-lock.json");
  }

  return {
    dependencies,
    detectedEcosystem: "npm",
    filename,
    totalParsed: dependencies.length,
    warnings,
  };
}

/**
 * Parse Python requirements.txt
 */
function parseRequirementsTxt(filename: string, content: string): ParseResult {
  const lines = content.split(/\r?\n/);
  const dependencies: ParsedDependency[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx].trim();
    // Skip empty lines and comments
    if (!rawLine || rawLine.startsWith("#") || rawLine.startsWith("-r") || rawLine.startsWith("-i")) {
      continue;
    }

    // Strip inline comments
    const lineWithoutComment = rawLine.split("#")[0].trim();

    // Check pinned version pattern: package==version
    const pinnedMatch = lineWithoutComment.match(/^([a-zA-Z0-9_\-\.]+)\s*==\s*([a-zA-Z0-9_\-\.\+]+)/);
    if (pinnedMatch) {
      const name = pinnedMatch[1];
      const version = pinnedMatch[2];
      const dedupeKey = `${name.toLowerCase()}@${version}`;

      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        dependencies.push({
          name,
          version,
          isDirect: true,
          ecosystem: "PyPI",
        });
      }
      continue;
    }

    // Check unpinned or constraint pattern: package>=version or package~=version
    const constraintMatch = lineWithoutComment.match(/^([a-zA-Z0-9_\-\.]+)\s*([><=~^!].*)$/);
    if (constraintMatch) {
      const name = constraintMatch[1];
      warnings.push(`Line ${idx + 1}: ${name} specifies constraint '${constraintMatch[2]}' rather than pinned exact version. Needs verification.`);
      continue;
    }

    // Plain package name without version
    const plainMatch = lineWithoutComment.match(/^([a-zA-Z0-9_\-\.]+)/);
    if (plainMatch) {
      warnings.push(`Line ${idx + 1}: ${plainMatch[1]} has no version pinned. Ignored for deterministic scan.`);
    }
  }

  return {
    dependencies,
    detectedEcosystem: "PyPI",
    filename,
    totalParsed: dependencies.length,
    warnings,
  };
}

/**
 * Parse pnpm-lock.yaml (Simple line-based scanner for package specifiers)
 */
function parsePnpmLock(filename: string, content: string): ParseResult {
  const lines = content.split(/\r?\n/);
  const dependencies: ParsedDependency[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();

  let inPackagesSection = false;

  for (const line of lines) {
    if (line.startsWith("packages:")) {
      inPackagesSection = true;
      continue;
    }

    if (inPackagesSection) {
      // End of packages section if a non-indented key starts
      if (line.length > 0 && !line.startsWith(" ") && !line.startsWith("\t")) {
        inPackagesSection = false;
        continue;
      }

      // Pattern: '  /@babel/core@7.24.0:' or '  lodash@4.17.21:'
      const pkgMatch = line.match(/^\s+['"]?(\/?[^@\s'"]+)@([0-9a-zA-Z\.\-_]+)/);
      if (pkgMatch) {
        let name = pkgMatch[1];
        if (name.startsWith("/")) name = name.slice(1);
        const version = pkgMatch[2];
        const dedupeKey = `${name}@${version}`;

        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          dependencies.push({
            name,
            version,
            isDirect: false, // pnpm lock separates root importers
            ecosystem: "npm",
          });
        }
      }
    }
  }

  return {
    dependencies,
    detectedEcosystem: "npm",
    filename,
    totalParsed: dependencies.length,
    warnings,
  };
}
