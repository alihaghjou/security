"use client";

import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileCode2,
  ShieldCheck,
  Trash2,
  Plus,
  RefreshCw,
  Terminal,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function DeveloperProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Import Dialog State
  const [importOpen, setImportOpen] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>("Backend API Service");
  const [filename, setFilename] = useState<string>("package-lock.json");
  const [fileContent, setFileContent] = useState<string>("");
  const [importing, setImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Preset sample lockfiles for 1-click test
  const sampleNpmLock = JSON.stringify(
    {
      name: "demo-service",
      version: "1.0.0",
      lockfileVersion: 3,
      packages: {
        "": {
          dependencies: {
            lodash: "^4.17.15",
            axios: "^0.21.1",
            express: "^4.19.2",
          },
        },
        "node_modules/lodash": {
          version: "4.17.15",
          resolved: "https://registry.npmjs.org/lodash/-/lodash-4.17.15.tgz",
        },
        "node_modules/axios": {
          version: "0.21.1",
          resolved: "https://registry.npmjs.org/axios/-/axios-0.21.1.tgz",
        },
        "node_modules/express": {
          version: "4.19.2",
          resolved: "https://registry.npmjs.org/express/-/express-4.19.2.tgz",
        },
      },
    },
    null,
    2
  );

  const sampleReqTxt = `# Python requirements.txt
requests==2.20.0
django==4.2.0
urllib3==1.26.4
`;

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      const list = data.projects || [];
      setProjects(list);
      if (list.length > 0 && !selectedProject) {
        setSelectedProject(list[0]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename || !fileContent) return;

    setImporting(true);
    setImportError(null);

    try {
      const res = await fetch("/api/projects/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          filename,
          content: fileContent,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to parse lockfile");
      }

      const data = await res.json();
      setImportOpen(false);
      setFileContent("");
      await fetchProjects();
      setSelectedProject(data.project);
    } catch (err: any) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this developer project?")) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Developer Security Mode
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400">Dependency Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FolderGit2 className="h-6 w-6 text-blue-400" />
            Developer Project Security
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Import dependency manifests and lockfiles to scan for published CVEs and GHSA advisories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setImportOpen(true)}
            size="sm"
            className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold gap-1.5 text-xs shadow-sm shadow-blue-500/20"
          >
            <Upload className="h-3.5 w-3.5" />
            Import Lockfile
          </Button>
        </div>
      </div>

      {/* Main Layout: Projects Sidebar + Inventory Table */}
      {loading ? (
        <div className="p-16 text-center bg-[#111C2E] rounded-2xl border border-slate-800 text-xs text-slate-400 animate-pulse">
          Loading developer projects and dependency vulnerabilities...
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-[#111C2E] rounded-2xl border border-slate-800 space-y-4">
          <FileCode2 className="h-10 w-10 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No developer projects imported yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Upload or paste your <code className="text-teal-300">package-lock.json</code>,{" "}
              <code className="text-teal-300">requirements.txt</code>, or{" "}
              <code className="text-teal-300">pnpm-lock.yaml</code> to audit dependencies safely without code execution.
            </p>
          </div>
          <Button
            onClick={() => {
              setFilename("package-lock.json");
              setFileContent(sampleNpmLock);
              setImportOpen(true);
            }}
            size="sm"
            className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-xs gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            Load Sample npm Lockfile
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Projects List Sidebar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              <span>Your Projects ({projects.length})</span>
            </div>
            <div className="space-y-2">
              {projects.map((proj) => {
                const isSelected = selectedProject?.id === proj.id;
                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProject(proj)}
                    className={`cursor-pointer p-4 rounded-xl border transition text-left flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-blue-500/10 border-blue-500/50 shadow-md"
                        : "bg-[#111C2E] border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="font-semibold text-sm text-white truncate">{proj.name}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Badge variant="outline" className="text-[10px] border-slate-700">
                          {proj.ecosystem}
                        </Badge>
                        <span>{proj.totalDependencies} deps</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        File: {proj.sourceFilename || "manifest"}
                      </div>
                    </div>

                    {proj.vulnerableCount > 0 ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 shrink-0">
                        {proj.vulnerableCount} vuln
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 shrink-0">
                        0 vuln
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Project Details & Dependency Findings */}
          <div className="lg:col-span-3 space-y-6">
            {selectedProject ? (
              <div className="bg-[#111C2E] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-bold text-white">{selectedProject.name}</h2>
                      <Badge variant="outline" className="text-xs border-slate-700">
                        {selectedProject.ecosystem}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>Source: {selectedProject.sourceFilename}</span>
                      <span>&bull;</span>
                      <span>Total dependencies: {selectedProject.totalDependencies}</span>
                      <span>&bull;</span>
                      <span>Scanned with OSV.dev</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(selectedProject.id)}
                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 text-xs gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Project
                    </Button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[#17243A] rounded-xl border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Total Dependencies</div>
                    <div className="text-xl font-bold text-white mt-0.5">
                      {selectedProject.totalDependencies}
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#17243A] rounded-xl border border-slate-800 text-center">
                    <div className="text-xs text-slate-400">Vulnerable Packages</div>
                    <div
                      className={`text-xl font-bold mt-0.5 ${
                        selectedProject.vulnerableCount > 0 ? "text-red-400" : "text-teal-400"
                      }`}
                    >
                      {selectedProject.vulnerableCount}
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#17243A] rounded-xl border border-slate-800 text-center col-span-2 sm:col-span-1">
                    <div className="text-xs text-slate-400">Scan Status</div>
                    <div className="text-xs font-semibold text-teal-300 mt-1.5 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Up to date
                    </div>
                  </div>
                </div>

                {/* Dependencies Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode2 className="h-4 w-4 text-blue-400" />
                    Dependency Inventory ({selectedProject.dependencies?.length || 0})
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-[#17243A] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Package</th>
                          <th className="py-2.5 px-3">Resolved Version</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Vulnerabilities</th>
                          <th className="py-2.5 px-3 text-right">Fix Recommendation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {selectedProject.dependencies?.map((dep: any) => {
                          const findings = dep.findings || [];
                          const hasVuln = findings.length > 0;
                          const fix = findings.find((f: any) => f.fixedVersion)?.fixedVersion;

                          return (
                            <tr
                              key={dep.id}
                              className={`hover:bg-[#17243A]/60 transition ${
                                hasVuln ? "bg-red-500/5" : ""
                              }`}
                            >
                              <td className="py-2.5 px-3 font-semibold text-white">
                                {dep.name}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-teal-300">
                                v{dep.version}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    dep.isDirect
                                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                      : "bg-slate-800 text-slate-400"
                                  }`}
                                >
                                  {dep.isDirect ? "Direct" : "Transitive"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                {hasVuln ? (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30">
                                      {findings.length} advisory
                                    </span>
                                    {findings.slice(0, 1).map((f: any) => (
                                      <span key={f.advisoryId} className="text-[10px] text-slate-400">
                                        ({f.advisoryId})
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-teal-400 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> None detected
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {fix ? (
                                  <span className="font-mono text-teal-400 font-semibold text-[11px]">
                                    Upgrade to {fix}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-[11px]">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Import Lockfile Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-xl bg-[#111C2E] border-slate-800 text-slate-100 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Upload className="h-5 w-5 text-blue-400" />
              Import Dependency Manifest
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Paste or upload your lockfile. Safe memory-only parser with zero code execution.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleImportSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Web Application"
                className="w-full bg-[#17243A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">File Type / Format</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFilename("package-lock.json");
                      setFileContent(sampleNpmLock);
                    }}
                    className="text-[10px] text-blue-400 hover:underline"
                  >
                    Sample npm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilename("requirements.txt");
                      setFileContent(sampleReqTxt);
                    }}
                    className="text-[10px] text-teal-400 hover:underline"
                  >
                    Sample requirements.txt
                  </button>
                </div>
              </div>

              <select
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full bg-[#17243A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400"
              >
                <option value="package-lock.json">package-lock.json (npm v1/v2/v3)</option>
                <option value="requirements.txt">requirements.txt (Python)</option>
                <option value="pnpm-lock.yaml">pnpm-lock.yaml (pnpm)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">File Content</label>
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                rows={8}
                placeholder="Paste the contents of your lockfile here..."
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
              />
            </div>

            {importError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setImportOpen(false)}
                className="text-xs text-slate-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={importing || !fileContent.trim()}
                className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-xs gap-1.5"
              >
                {importing ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                Run Batch Vulnerability Scan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
