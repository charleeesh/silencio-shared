#!/usr/bin/env node
// Stav všech appek Silencio na jeden pohled: git, verze klíčových knihoven
// (jak je zapsal package-lock) a volitelně npm audit. Nic nemění.
//
//   node scripts/stav-appek.mjs            # git + verze (offline, rychlé)
//   node scripts/stav-appek.mjs --fetch    # napřed git fetch (přesné ahead/behind)
//   node scripts/stav-appek.mjs --audit    # navíc npm audit každého repa (síť)
//
// Repa hledá jako sourozence složky `shared` (…/silencio/<repo>), takže funguje
// stejně na Macu (~/Documents/Webove_projekty) i na VPS (~/Webove_projekty).
// Popis výstupu a co s rozdíly dělat: docs/mapa-appek.md.

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPOS = ["hub", "budgeting", "cashflow", "voicehub", "set", "shared"];
const PACKAGES = [
  "react",
  "react-router-dom",
  "silencio-shared",
  "vite",
  "typescript",
  "tailwindcss",
  "@supabase/supabase-js",
  "@tanstack/react-query",
  "zod",
  "@hookform/resolvers",
  "react-hook-form",
  "lucide-react",
  "sonner",
  "tailwind-merge",
  "date-fns",
  "vitest",
  "eslint",
];

const args = new Set(process.argv.slice(2));
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sh = (cmd, cwd) =>
  execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

const found = REPOS.filter((r) => existsSync(join(root, r, "package.json")));
const missing = REPOS.filter((r) => !found.includes(r));
console.log(`Appky Silencio — ${root}`);
if (missing.length) console.log(`(chybí: ${missing.join(", ")})`);

// --- git -------------------------------------------------------------------
console.log("\nGit (main vs origin/main):");
for (const r of found) {
  const dir = join(root, r);
  try {
    if (args.has("--fetch")) sh("git fetch -q origin", dir);
    const branch = sh("git rev-parse --abbrev-ref HEAD", dir);
    const [behind, ahead] = sh("git rev-list --left-right --count origin/main...HEAD", dir).split(/\s+/);
    const dirty = sh("git status --porcelain", dir).split("\n").filter(Boolean).length;
    const worktrees = sh("git worktree list", dir).split("\n").filter(Boolean).length - 1;
    const notes = [
      branch !== "main" && `větev ${branch}!`,
      ahead !== "0" && `${ahead} nepushnuto`,
      behind !== "0" && `${behind} nestaženo (gsync)`,
      dirty && `${dirty} neuložených souborů`,
      worktrees > 0 && `${worktrees} worktree navíc`,
    ].filter(Boolean);
    console.log(`  ${r.padEnd(10)} ${notes.length ? notes.join(", ") : "čisté, srovnané"}`);
  } catch {
    console.log(`  ${r.padEnd(10)} (git nejde přečíst)`);
  }
}

// --- verze -----------------------------------------------------------------
const versions = {};
for (const r of found) {
  const dir = join(root, r);
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const lockPath = join(dir, "package-lock.json");
  const lock = existsSync(lockPath) ? JSON.parse(readFileSync(lockPath, "utf8")).packages ?? {} : {};
  versions[r] = {};
  for (const p of PACKAGES) {
    const range = pkg.dependencies?.[p] ?? pkg.devDependencies?.[p];
    if (!range) continue;
    versions[r][p] =
      p === "silencio-shared"
        ? (range.match(/#(.+)$/) ?? [])[1] ?? range
        : lock[`node_modules/${p}`]?.version ?? range;
  }
}
const major = (v) => (v.startsWith("0.") ? v.split(".").slice(0, 2).join(".") : v.split(".")[0]);
console.log("\nVerze (z package-lock):");
console.log("  " + "balíček".padEnd(24) + found.map((r) => r.padEnd(11)).join(""));
for (const p of PACKAGES) {
  const vals = found.map((r) => versions[r][p] ?? "-");
  if (vals.every((v) => v === "-")) continue;
  const majors = new Set(vals.filter((v) => v !== "-").map(major));
  const flag = majors.size > 1 ? "  ← rozdíl (zapsaný v docs/mapa-appek.md?)" : "";
  console.log("  " + p.padEnd(24) + vals.map((v) => v.padEnd(11)).join("") + flag);
}

// --- audit -----------------------------------------------------------------
if (args.has("--audit")) {
  console.log("\nnpm audit:");
  for (const r of found) {
    let out;
    try {
      out = execSync("npm audit --json", { cwd: join(root, r), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    } catch (e) {
      out = e.stdout; // npm audit končí nenulově, když něco najde
    }
    try {
      const m = JSON.parse(out).metadata.vulnerabilities;
      const parts = ["critical", "high", "moderate", "low"].filter((k) => m[k]).map((k) => `${m[k]} ${k}`);
      console.log(`  ${r.padEnd(10)} ${m.total ? `${m.total} (${parts.join(", ")})` : "0"}`);
    } catch {
      console.log(`  ${r.padEnd(10)} (audit selhal)`);
    }
  }
} else {
  console.log("\n(npm audit: spusť s --audit)");
}
