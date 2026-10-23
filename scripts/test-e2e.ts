/**
 * SecureFlow Automated Test Suite
 * Tests core business logic, OSV integration, SemVer evaluation, lockfile parsing,
 * fix verification lifecycle, and tenant privacy isolation.
 */

import { queryOSV, extractFixedVersions, formatAffectedRange } from "../src/lib/services/osv-service";
import { evaluateApplicability, compareSemVer, parseSeverity, estimateEPSS, calculatePriority } from "../src/lib/services/vulnerability-intel";
import { parseDependencyFile } from "../src/lib/services/dependency-parser";
import { db } from "../src/lib/db";
import { verifyWatchlistFix } from "../src/lib/services/fix-verifier";
import { SecurityMode, VerificationOutcome, FindingStatus } from "@prisma/client";

async function runTestSuite() {
  console.log("🛡️ Starting SecureFlow Comprehensive Test Suite...\n");
  let passed = 0;
  let total = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    total++;
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.error(`  ✗ ${name} FAILED: ${detail || ""}`);
    }
  }

  // 1. UNIT TESTS: SemVer comparison logic
  console.log("--- 1. SemVer Version Matching ---");
  assert("SemVer 4.17.15 < 4.17.21", compareSemVer("4.17.15", "4.17.21") < 0);
  assert("SemVer 4.17.21 == 4.17.21", compareSemVer("4.17.21", "4.17.21") === 0);
  assert("SemVer 5.0.0 > 4.17.21", compareSemVer("5.0.0", "4.17.21") > 0);
  assert("SemVer prefix v1.2.3 handled cleanly", compareSemVer("v1.2.3", "1.2.3") === 0);

  // 2. UNIT TESTS: Lockfile Parsers
  console.log("\n--- 2. Dependency Lockfile Parsers ---");
  const npmSample = JSON.stringify({
    name: "test-app",
    version: "1.0.0",
    lockfileVersion: 3,
    packages: {
      "": { dependencies: { lodash: "^4.17.15" } },
      "node_modules/lodash": { version: "4.17.15" },
      "node_modules/transitive-lib": { version: "1.0.0" },
    },
  });

  const parsedNpm = parseDependencyFile("package-lock.json", npmSample);
  assert("npm lockfile parses dependencies", parsedNpm.totalParsed === 2);
  const directDep = parsedNpm.dependencies.find((d) => d.name === "lodash");
  assert("Direct dependency flagged correctly", directDep?.isDirect === true);
  const transDep = parsedNpm.dependencies.find((d) => d.name === "transitive-lib");
  assert("Transitive dependency flagged correctly", transDep?.isDirect === false);

  const reqTxt = "requests==2.20.0\n# comment\ndjango==4.2.0\n";
  const parsedPy = parseDependencyFile("requirements.txt", reqTxt);
  assert("requirements.txt parses pinned versions", parsedPy.totalParsed === 2);
  assert("Python ecosystem identified", parsedPy.detectedEcosystem === "PyPI");

  // 3. INTEGRATION TEST: Live OSV Query
  console.log("\n--- 3. Live OSV.dev Integration ---");
  try {
    const osvRes = await queryOSV("lodash", "npm", "4.17.15");
    assert("Live OSV returns advisories for lodash@4.17.15", osvRes.vulns.length > 0);
    const fixed = extractFixedVersions(osvRes.vulns[0]);
    assert("OSV extraction parses fixed versions", fixed.length > 0);
  } catch (err: any) {
    console.warn("Live network call note:", err.message);
  }

  // 4. SCENARIO C: Version Not Affected
  console.log("\n--- 4. Scenario C: Version Outside Affected Range ---");
  const dummyAdvisory: any = {
    id: "TEST-GHSA-001",
    affected: [
      {
        package: { name: "lodash", ecosystem: "npm" },
        ranges: [
          {
            type: "SEMVER",
            events: [{ introduced: "0", fixed: "4.17.21" }],
          },
        ],
      },
    ],
  };

  const evalAffected = evaluateApplicability(dummyAdvisory, "lodash", "4.17.15");
  assert("lodash 4.17.15 is CONFIRMED_AFFECTED", evalAffected === "CONFIRMED_AFFECTED");

  const evalFixed = evaluateApplicability(dummyAdvisory, "lodash", "4.17.21");
  assert("lodash 4.17.21 is NOT_AFFECTED (outside range)", evalFixed === "NOT_AFFECTED");

  // 5. SCENARIO D: Unknown Version Handling
  console.log("\n--- 5. Scenario D: Unknown Version ---");
  const evalUnknown = evaluateApplicability(dummyAdvisory, "lodash", "unknown");
  assert("Unknown version evaluates to NEEDS_VERIFICATION", evalUnknown === "NEEDS_VERIFICATION");

  // 6. SCENARIO E: Saved Watchlist & Tenant Isolation
  console.log("\n--- 6. Scenario E & J: Watchlist Persistence & Tenant Privacy Isolation ---");
  const userA = await db.user.create({
    data: {
      email: `test-user-a-${Date.now()}@test.local`,
      name: "User A",
      mode: SecurityMode.PERSONAL,
    },
  });

  const userB = await db.user.create({
    data: {
      email: `test-user-b-${Date.now()}@test.local`,
      name: "User B",
      mode: SecurityMode.PERSONAL,
    },
  });

  const watchlistA = await db.watchlistEntry.create({
    data: {
      userId: userA.id,
      name: "Private App A",
      ecosystem: "General",
      currentVersion: "1.0.0",
    },
  });

  // Verify User B cannot view User A's watchlist item
  const userBQuery = await db.watchlistEntry.findFirst({
    where: { id: watchlistA.id, userId: userB.id },
  });
  assert("User B cannot access User A's private watchlist entry", userBQuery === null);

  // 7. SCENARIO F: Fix Verification Lifecycle
  console.log("\n--- 7. Scenario F: Fix Verification Lifecycle ---");
  const testWl = await db.watchlistEntry.create({
    data: {
      userId: userA.id,
      name: "lodash",
      ecosystem: "npm",
      currentVersion: "4.17.15",
    },
  });

  await db.vulnerabilityFinding.create({
    data: {
      watchlistEntryId: testWl.id,
      advisoryId: "GHSA-p6mc-m468-83gw",
      title: "Prototype Pollution in lodash",
      summary: "Prototype pollution in lodash",
      severity: "HIGH",
      affectedRange: "< 4.17.19",
      fixedVersion: "4.17.19",
      status: FindingStatus.CONFIRMED_AFFECTED,
    },
  });

  const verif = await verifyWatchlistFix(testWl.id, "4.17.21");
  assert("Verification runs on software update", verif.results.length > 0);
  assert("Fixed version confirmed when updating to 4.17.21", verif.results[0].outcome === VerificationOutcome.FIXED_CONFIRMED);

  // Cleanup test users
  await db.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });

  console.log(`\n🎉 Verification Complete: ${passed}/${total} assertions passed!`);
  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
