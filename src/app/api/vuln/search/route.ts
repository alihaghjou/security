import { NextRequest, NextResponse } from "next/server";

export interface SoftwareCatalogItem {
  name: string;
  ecosystem: string;
  category: "browser" | "framework" | "package" | "tool" | "os";
  mode: "PERSONAL" | "DEVELOPER" | "BOTH";
  description: string;
  popularVersions: string[];
}

const CATALOG: SoftwareCatalogItem[] = [
  // Personal Mode / Consumer
  {
    name: "Google Chrome",
    ecosystem: "General",
    category: "browser",
    mode: "PERSONAL",
    description: "Web browser by Google",
    popularVersions: ["131.0.6778.85", "130.0.6723.116", "128.0.6613.84"],
  },
  {
    name: "Mozilla Firefox",
    ecosystem: "General",
    category: "browser",
    mode: "PERSONAL",
    description: "Open-source web browser by Mozilla",
    popularVersions: ["133.0", "132.0.2", "131.0.3"],
  },
  {
    name: "Node.js",
    ecosystem: "General",
    category: "tool",
    mode: "BOTH",
    description: "JavaScript runtime built on V8",
    popularVersions: ["22.12.0", "20.18.1", "18.20.5"],
  },
  {
    name: "Python",
    ecosystem: "General",
    category: "tool",
    mode: "BOTH",
    description: "Interpreted high-level programming language",
    popularVersions: ["3.13.1", "3.12.7", "3.11.10"],
  },
  // Developer Mode Frameworks & Packages
  {
    name: "lodash",
    ecosystem: "npm",
    category: "package",
    mode: "DEVELOPER",
    description: "A modern JavaScript utility library delivering modularity and performance",
    popularVersions: ["4.17.21", "4.17.15", "4.17.11"],
  },
  {
    name: "react",
    ecosystem: "npm",
    category: "framework",
    mode: "DEVELOPER",
    description: "The library for web and native user interfaces",
    popularVersions: ["19.0.0", "18.3.1", "18.2.0"],
  },
  {
    name: "next",
    ecosystem: "npm",
    category: "framework",
    mode: "DEVELOPER",
    description: "The React Framework for the Web",
    popularVersions: ["15.1.0", "14.2.15", "13.5.6"],
  },
  {
    name: "express",
    ecosystem: "npm",
    category: "framework",
    mode: "DEVELOPER",
    description: "Fast, unopinionated, minimalist web framework for node",
    popularVersions: ["4.21.2", "4.19.2", "4.17.1"],
  },
  {
    name: "axios",
    ecosystem: "npm",
    category: "package",
    mode: "DEVELOPER",
    description: "Promise based HTTP client for the browser and node.js",
    popularVersions: ["1.7.9", "1.6.0", "0.21.1"],
  },
  {
    name: "requests",
    ecosystem: "PyPI",
    category: "package",
    mode: "DEVELOPER",
    description: "A simple, yet elegant, HTTP library for Python",
    popularVersions: ["2.32.3", "2.31.0", "2.20.0"],
  },
  {
    name: "django",
    ecosystem: "PyPI",
    category: "framework",
    mode: "DEVELOPER",
    description: "The Web framework for perfectionists with deadlines",
    popularVersions: ["5.1.4", "5.0.9", "4.2.16"],
  },
  {
    name: "flask",
    ecosystem: "PyPI",
    category: "framework",
    mode: "DEVELOPER",
    description: "A simple framework for building complex web applications",
    popularVersions: ["3.1.0", "3.0.3", "2.3.3"],
  },
  {
    name: "urllib3",
    ecosystem: "PyPI",
    category: "package",
    mode: "DEVELOPER",
    description: "HTTP library with thread-safe connection pooling, file post, and more",
    popularVersions: ["2.2.3", "2.0.7", "1.26.18"],
  },
  {
    name: "tokio",
    ecosystem: "crates.io",
    category: "package",
    mode: "DEVELOPER",
    description: "An event-driven, non-blocking I/O platform for writing asynchronous applications",
    popularVersions: ["1.42.0", "1.38.0", "1.28.0"],
  },
  {
    name: "gin",
    ecosystem: "Go",
    category: "framework",
    mode: "DEVELOPER",
    description: "Gin is a HTTP web framework written in Go",
    popularVersions: ["1.10.0", "1.9.1", "1.8.0"],
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();
  const mode = searchParams.get("mode")?.toUpperCase() || "ALL";

  let results = CATALOG;

  if (mode === "PERSONAL") {
    results = results.filter((item) => item.mode === "PERSONAL" || item.mode === "BOTH");
  } else if (mode === "DEVELOPER") {
    results = results.filter((item) => item.mode === "DEVELOPER" || item.mode === "BOTH");
  }

  if (q) {
    results = results.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.ecosystem.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    query: q,
    count: results.length,
    results,
  });
}
