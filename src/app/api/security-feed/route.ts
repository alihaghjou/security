import { NextResponse } from "next/server";

export async function GET() {
  const feedItems = [
    {
      id: "KEV-2024-3094",
      title: "CISA KEV Alert: Backdoor in upstream XZ Utils (CVE-2024-3094)",
      category: "EXPLOITED_IN_THE_WILD",
      severity: "CRITICAL",
      date: "2024-03-31",
      source: "CISA Known Exploited Catalog",
      summary: "Malicious code was discovered in xz-utils tarballs versions 5.6.0 and 5.6.1 compromising sshd authentication.",
      affectedEcosystems: ["Linux", "General"],
      actionRecommended: "Downgrade immediately to xz-utils 5.4.6 or uncompromised build.",
    },
    {
      id: "GHSA-j8xg-fqg3-53r8",
      title: "Critical Prototype Pollution in lodash",
      category: "SECURITY_ADVISORY",
      severity: "HIGH",
      date: "2023-10-15",
      source: "GitHub Advisory Database",
      summary: "Versions of lodash before 4.17.21 are vulnerable to Command Injection and Prototype Pollution via template.",
      affectedEcosystems: ["npm"],
      actionRecommended: "Upgrade lodash to 4.17.21 or higher.",
    },
    {
      id: "CVE-2023-4863",
      title: "Heap buffer overflow in libwebp affecting Chrome, Firefox, and Electron",
      category: "SECURITY_UPDATE",
      severity: "CRITICAL",
      date: "2023-09-12",
      source: "Google Chrome Releases / Mozilla Security",
      summary: "Opening a malicious WebP lossless image could lead to remote code execution in web browsers.",
      affectedEcosystems: ["General", "Browsers"],
      actionRecommended: "Update Chrome to 116.0.5845.187+ or Firefox to 117.0.1+.",
    },
    {
      id: "GHSA-c2qf-rxjj-qqgw",
      title: "Next.js Server Actions CSRF and Cache Poisoning Advisory",
      category: "SECURITY_ADVISORY",
      severity: "MEDIUM",
      date: "2024-02-20",
      source: "Vercel Security",
      summary: "Specially crafted request headers could cause cache poisoning under certain CDN proxy topologies.",
      affectedEcosystems: ["npm"],
      actionRecommended: "Update next package to 14.1.1 or 13.5.7.",
    },
  ];

  return NextResponse.json({
    items: feedItems,
    lastUpdated: new Date().toISOString(),
  });
}
