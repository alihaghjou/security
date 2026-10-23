/**
 * Fix Verification Service
 * Evaluates whether an updated software version resolves an active vulnerability finding.
 * Records state transitions deterministically.
 */

import { db } from "@/lib/db";
import { getOSVVulnerability } from "./osv-service";
import { evaluateApplicability } from "./vulnerability-intel";
import { VerificationOutcome, FindingStatus } from "@prisma/client";

export interface VerificationResult {
  outcome: VerificationOutcome;
  notes: string;
  advisoryId: string;
  previousVersion: string;
  newVersion: string;
}

/**
 * Verify a fix for a specific watchlist entry when the user updates its version.
 */
export async function verifyWatchlistFix(
  watchlistEntryId: string,
  newVersion: string
): Promise<{
  results: VerificationResult[];
  newStatus: string;
  updatedFindingsCount: number;
}> {
  const entry = await db.watchlistEntry.findUnique({
    where: { id: watchlistEntryId },
    include: { findings: true },
  });

  if (!entry) {
    throw new Error(`Watchlist entry not found: ${watchlistEntryId}`);
  }

  const previousVersion = entry.currentVersion;
  const results: VerificationResult[] = [];
  let updatedFindingsCount = 0;

  // Process each finding associated with this software
  for (const finding of entry.findings) {
    // Only verify findings that were previously confirmed or potentially affected
    if (finding.status !== FindingStatus.CONFIRMED_AFFECTED && finding.status !== FindingStatus.POTENTIALLY_AFFECTED) {
      continue;
    }

    let outcome: VerificationOutcome = VerificationOutcome.UNABLE_TO_VERIFY;
    let notes = "";

    try {
      const rawAdvisory = await getOSVVulnerability(finding.advisoryId);
      if (!rawAdvisory) {
        outcome = VerificationOutcome.UNABLE_TO_VERIFY;
        notes = `Upstream advisory ${finding.advisoryId} could not be retrieved from OSV.`;
      } else {
        const check = evaluateApplicability(rawAdvisory, entry.name, newVersion);
        if (check === "NOT_AFFECTED") {
          outcome = VerificationOutcome.FIXED_CONFIRMED;
          notes = `Version ${newVersion} is verified outside the affected range (${finding.affectedRange || "known vulnerable versions"}). Fixed version confirmed.`;
          
          await db.vulnerabilityFinding.update({
            where: { id: finding.id },
            data: {
              status: FindingStatus.VERIFIED_FIXED,
              resolvedAt: new Date(),
            },
          });
          updatedFindingsCount++;
        } else if (check === "CONFIRMED_AFFECTED") {
          outcome = VerificationOutcome.STILL_AFFECTED;
          notes = `Version ${newVersion} remains within the affected range (${finding.affectedRange || "known vulnerable versions"}).`;
        } else {
          outcome = VerificationOutcome.UNABLE_TO_VERIFY;
          notes = `Version ${newVersion} applicability is indeterminate under available advisory metadata.`;
        }
      }
    } catch (err: any) {
      outcome = VerificationOutcome.UNABLE_TO_VERIFY;
      notes = `Verification check error: ${err.message}`;
    }

    // Save persistent verification record
    await db.fixVerificationRecord.create({
      data: {
        watchlistEntryId,
        advisoryId: finding.advisoryId,
        previousVersion,
        newVersion,
        outcome,
        notes,
      },
    });

    results.push({
      outcome,
      notes,
      advisoryId: finding.advisoryId,
      previousVersion,
      newVersion,
    });
  }

  // Update watchlist entry current version & timestamp
  await db.watchlistEntry.update({
    where: { id: watchlistEntryId },
    data: {
      currentVersion: newVersion,
      lastCheckedAt: new Date(),
    },
  });

  return {
    results,
    newStatus: "UPDATED",
    updatedFindingsCount,
  };
}
