/**
 * SecureFlow End-to-End Automated Verification Script
 */
async function runTests() {
  const baseUrl = "http://localhost:3000";
  console.log("🔍 Running SecureFlow automated verification suite...");

  const checks: { name: string; url: string; method?: string; body?: any; expectedStatus: number }[] = [
    { name: "Public Homepage", url: `${baseUrl}/`, expectedStatus: 200 },
    { name: "User Dashboard", url: `${baseUrl}/dashboard`, expectedStatus: 200 },
    { name: "User Alerts Stream", url: `${baseUrl}/dashboard/alerts`, expectedStatus: 200 },
    { name: "User Protection Hygiene", url: `${baseUrl}/dashboard/protection`, expectedStatus: 200 },
    { name: "User Support Center", url: `${baseUrl}/dashboard/support`, expectedStatus: 200 },
    { name: "User Profile", url: `${baseUrl}/dashboard/profile`, expectedStatus: 200 },
    { name: "Technician Queue", url: `${baseUrl}/technician`, expectedStatus: 200 },
    { name: "Technician Availability", url: `${baseUrl}/technician/availability`, expectedStatus: 200 },
    { name: "Technician Runbooks", url: `${baseUrl}/technician/runbooks`, expectedStatus: 200 },
    { name: "Technician Search", url: `${baseUrl}/technician/search`, expectedStatus: 200 },
    { name: "Admin Dashboard", url: `${baseUrl}/admin`, expectedStatus: 200 },
    { name: "Admin Incidents", url: `${baseUrl}/admin/incidents`, expectedStatus: 200 },
    { name: "Admin Technicians", url: `${baseUrl}/admin/technicians`, expectedStatus: 200 },
    { name: "Admin Users", url: `${baseUrl}/admin/users`, expectedStatus: 200 },
    { name: "Admin Escalation", url: `${baseUrl}/admin/escalation`, expectedStatus: 200 },
    { name: "Admin Integrations", url: `${baseUrl}/admin/integrations`, expectedStatus: 200 },
    { name: "Admin Reports & Audit", url: `${baseUrl}/admin/reports`, expectedStatus: 200 },
    { name: "API Metrics", url: `${baseUrl}/api/admin/metrics`, expectedStatus: 200 },
    { name: "API Incidents List", url: `${baseUrl}/api/incidents`, expectedStatus: 200 },
    { name: "API Notifications", url: `${baseUrl}/api/notifications`, expectedStatus: 200 },
  ];

  let passed = 0;

  for (const check of checks) {
    try {
      const res = await fetch(check.url, {
        method: check.method || "GET",
        headers: { "Content-Type": "application/json" },
        body: check.body ? JSON.stringify(check.body) : undefined,
      });

      if (res.status === check.expectedStatus) {
        console.log(`  ✓ ${check.name} [HTTP ${res.status}]`);
        passed++;
      } else {
        console.error(`  ✗ ${check.name} failed: expected ${check.expectedStatus}, got ${res.status}`);
      }
    } catch (err) {
      console.error(`  ✗ ${check.name} failed to fetch:`, err);
    }
  }

  // Test 5 Scenarios
  console.log("\n🧪 Exercising 5 Core Demo Scenarios...");
  for (let s = 1; s <= 5; s++) {
    try {
      const res = await fetch(`${baseUrl}/api/demo/scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: s }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        console.log(`  ✓ Scenario ${s} Executed Successfully: ${data.message}`);
        passed++;
      } else {
        console.error(`  ✗ Scenario ${s} failed:`, data);
      }
    } catch (e) {
      console.error(`  ✗ Scenario ${s} network error:`, e);
    }
  }

  console.log(`\n🎉 Verification Complete: ${passed}/${checks.length + 5} tests passed!`);
  if (passed === checks.length + 5) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
