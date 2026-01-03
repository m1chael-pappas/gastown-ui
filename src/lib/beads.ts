import { readFileSync, existsSync } from "fs";
import { Bead } from "@/types/gastown";

const GASTOWN_PATH = process.env.GASTOWN_PATH || "~/gt";

function expandPath(path: string): string {
  if (path.startsWith("~/")) {
    return path.replace("~", process.env.HOME || "");
  }
  return path;
}

export function getBeadsFilePath(rig?: string): string {
  const basePath = expandPath(GASTOWN_PATH);
  if (rig) {
    return `${basePath}/rigs/${rig}/.beads/beads.jsonl`;
  }
  return `${basePath}/.beads/beads.jsonl`;
}

export function parseBeadsFile(filePath: string): Bead[] {
  const expandedPath = expandPath(filePath);

  if (!existsSync(expandedPath)) {
    return [];
  }

  try {
    const content = readFileSync(expandedPath, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);

    return lines.map((line) => {
      try {
        return JSON.parse(line) as Bead;
      } catch {
        console.error("Failed to parse bead line:", line);
        return null;
      }
    }).filter((bead): bead is Bead => bead !== null);
  } catch (error) {
    console.error("Failed to read beads file:", error);
    return [];
  }
}

export function getAllBeads(rig?: string): Bead[] {
  const filePath = getBeadsFilePath(rig);
  return parseBeadsFile(filePath);
}

export function getBeadById(id: string, rig?: string): Bead | undefined {
  const beads = getAllBeads(rig);
  return beads.find((bead) => bead.id === id);
}

export function getBeadsByStatus(status: string, rig?: string): Bead[] {
  const beads = getAllBeads(rig);
  return beads.filter((bead) => bead.status === status);
}

export function getActionableBeads(rig?: string): Bead[] {
  const beads = getAllBeads(rig);
  return beads.filter((bead) => {
    if (bead.status !== "open" && bead.status !== "ready") return false;
    if (!bead.depends_on || bead.depends_on.length === 0) return true;

    // Check if all dependencies are closed
    return bead.depends_on.every((depId) => {
      const dep = beads.find((b) => b.id === depId);
      return dep?.status === "closed";
    });
  });
}

export function getBeadsStats(rig?: string) {
  const beads = getAllBeads(rig);

  return {
    total: beads.length,
    open: beads.filter((b) => b.status === "open").length,
    in_progress: beads.filter((b) => b.status === "in_progress").length,
    blocked: beads.filter((b) => b.status === "blocked").length,
    closed: beads.filter((b) => b.status === "closed").length,
    ready: beads.filter((b) => b.status === "ready").length,
    actionable: getActionableBeads(rig).length,
  };
}
