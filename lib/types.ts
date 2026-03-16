import type { z } from "zod";
import { roastComponentDefinitions } from "@/lib/catalog";

type RoastComponentDefinitions = typeof roastComponentDefinitions;

/** Scene props inferred from the catalog. Single source of truth is catalog's Zod schemas. */
export type RoastOpenerProps = z.infer<
  RoastComponentDefinitions["RoastOpener"]["props"]
>;
export type CrimeStatProps = z.infer<
  RoastComponentDefinitions["CrimeStat"]["props"]
>;
export type ShameTimelineProps = z.infer<
  RoastComponentDefinitions["ShameTimeline"]["props"]
>;
export type HallOfFameProps = z.infer<
  RoastComponentDefinitions["HallOfFame"]["props"]
>;
export type VerdictProps = z.infer<
  RoastComponentDefinitions["Verdict"]["props"]
>;

export type Severity = CrimeStatProps["severity"];

export type RepoData = {
  owner: string;
  repo: string;
  repoMeta: {
    fullName: string;
    description: string | null;
    stars: number;
    forks: number;
    openIssues: number;
    primaryLanguage: string | null;
  };
  languages: Array<{ name: string; bytes: number; percent: number }>;
  commits: Array<{
    sha: string;
    message: string;
    authoredAt: string;
    authorName: string | null;
  }>;
  commitStats: {
    totalCommits: number;
    fixCommitRatio: number;
    lateNightCommitRatio: number;
    topCommitHours: Array<{ hourUtc: number; count: number }>;
  };
  contributors: Array<{ login: string; contributions: number }>;
  rootFiles: Array<{ name: string; path: string; size: number; type: string }>;
  sampledFiles: Array<{
    path: string;
    size: number;
    languageGuess: string | null;
    snippet: string;
  }>;
};
