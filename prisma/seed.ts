import { PrismaClient, SecurityMode, PriorityLevel, FindingStatus, VerificationOutcome } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SecureFlow database with self-service cybersecurity fixtures...");

  // Clean existing tables
  await prisma.fixVerificationRecord.deleteMany();
  await prisma.vulnerabilityFinding.deleteMany();
  await prisma.projectDependency.deleteMany();
  await prisma.project.deleteMany();
  await prisma.watchlistEntry.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Default Users
  const personalUser = await prisma.user.create({
    data: {
      email: "demo-user@secureflow.local",
      name: "Demo User",
      mode: SecurityMode.PERSONAL,
    },
  });

  const devUser = await prisma.user.create({
    data: {
      email: "developer@secureflow.local",
      name: "Alex Dev",
      mode: SecurityMode.DEVELOPER,
    },
  });

  // 2. Create Watchlist for Personal User
  const chromeEntry = await prisma.watchlistEntry.create({
    data: {
      userId: personalUser.id,
      name: "Google Chrome",
      ecosystem: "General",
      currentVersion: "128.0.6613.84",
      platform: "Desktop",
      isMonitored: true,
    },
  });

  const lodashEntry = await prisma.watchlistEntry.create({
    data: {
      userId: personalUser.id,
      name: "lodash",
      ecosystem: "npm",
      currentVersion: "4.17.15",
      platform: "Desktop",
      isMonitored: true,
    },
  });

  // 3. Create Vulnerability Findings for lodash
  await prisma.vulnerabilityFinding.create({
    data: {
      watchlistEntryId: lodashEntry.id,
      advisoryId: "GHSA-p6mc-m468-83gw",
      aliases: ["CVE-2020-8203"],
      title: "Prototype Pollution in lodash",
      summary: "Prototype pollution in lodash versions prior to 4.17.19 allows attackers to cause a denial of service or execute arbitrary code.",
      severity: "HIGH",
      cvssScore: 7.4,
      epssScore: 0.12,
      isKev: false,
      priority: PriorityLevel.UPDATE_RECOMMENDED,
      affectedRange: "< 4.17.19",
      fixedVersion: "4.17.19",
      status: FindingStatus.CONFIRMED_AFFECTED,
      sourceUrl: "https://osv.dev/vulnerability/GHSA-p6mc-m468-83gw",
    },
  });

  await prisma.vulnerabilityFinding.create({
    data: {
      watchlistEntryId: lodashEntry.id,
      advisoryId: "GHSA-35jh-r3h4-6jhm",
      aliases: ["CVE-2021-23337"],
      title: "Command Injection in lodash template",
      summary: "Lodash prior to 4.17.21 is vulnerable to Command Injection via template functions.",
      severity: "HIGH",
      cvssScore: 7.2,
      epssScore: 0.28,
      isKev: false,
      priority: PriorityLevel.UPDATE_RECOMMENDED,
      affectedRange: "< 4.17.21",
      fixedVersion: "4.17.21",
      status: FindingStatus.CONFIRMED_AFFECTED,
      sourceUrl: "https://osv.dev/vulnerability/GHSA-35jh-r3h4-6jhm",
    },
  });

  // 4. Create Fix Verification History
  await prisma.fixVerificationRecord.create({
    data: {
      watchlistEntryId: lodashEntry.id,
      advisoryId: "GHSA-p6mc-m468-83gw",
      previousVersion: "4.17.11",
      newVersion: "4.17.15",
      outcome: VerificationOutcome.STILL_AFFECTED,
      notes: "Version 4.17.15 remains within the affected range (< 4.17.19). Fix requires version 4.17.19 or higher.",
    },
  });

  // 5. Create Developer Project for devUser
  const project = await prisma.project.create({
    data: {
      userId: devUser.id,
      name: "API Gateway Microservice",
      ecosystem: "npm",
      sourceFilename: "package-lock.json",
      totalDependencies: 3,
      vulnerableCount: 1,
    },
  });

  const dep1 = await prisma.projectDependency.create({
    data: {
      projectId: project.id,
      name: "lodash",
      version: "4.17.15",
      isDirect: true,
      ecosystem: "npm",
    },
  });

  await prisma.projectDependency.create({
    data: {
      projectId: project.id,
      name: "express",
      version: "4.19.2",
      isDirect: true,
      ecosystem: "npm",
    },
  });

  await prisma.vulnerabilityFinding.create({
    data: {
      projectDependencyId: dep1.id,
      advisoryId: "GHSA-35jh-r3h4-6jhm",
      aliases: ["CVE-2021-23337"],
      title: "Command Injection in lodash template",
      summary: "Lodash prior to 4.17.21 is vulnerable to Command Injection via template functions.",
      severity: "HIGH",
      cvssScore: 7.2,
      epssScore: 0.28,
      isKev: false,
      priority: PriorityLevel.UPDATE_RECOMMENDED,
      affectedRange: "< 4.17.21",
      fixedVersion: "4.17.21",
      status: FindingStatus.CONFIRMED_AFFECTED,
      sourceUrl: "https://osv.dev/vulnerability/GHSA-35jh-r3h4-6jhm",
    },
  });

  console.log("✅ SecureFlow database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
