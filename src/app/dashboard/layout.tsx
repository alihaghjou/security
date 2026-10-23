import { Navbar } from "@/components/shared/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-800/80 bg-[#0B1220] py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">SecureFlow</span>
            <span>&bull;</span>
            <span>Self-Service Vulnerability Assistant</span>
          </div>
          <div>
            Powered by live OSV.dev, NIST NVD, FIRST EPSS & CISA KEV intelligence
          </div>
        </div>
      </footer>
    </div>
  );
}
