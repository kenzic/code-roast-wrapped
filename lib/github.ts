import type { RepoData } from "@/lib/types";

const GITHUB_API = "https://api.github.com";
const MAX_COMMITS = 100;
const MAX_FILE_SAMPLES = 3;
const MAX_SNIPPET_CHARS = 800;

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".rb",
  ".php",
  ".swift",
  ".kt",
  ".c",
  ".cc",
  ".cpp",
  ".h",
  ".hpp",
  ".cs",
]);

const EXCLUDED_FILE_NAMES = new Set([
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "tsconfig.json",
  "jsconfig.json",
  "README.md",
  "readme.md",
  "LICENSE",
  "license",
  ".gitignore",
  ".gitattributes",
  "Dockerfile",
  "docker-compose.yml",
  ".env",
  ".env.example",
]);

type GitHubRepoMetaResponse = {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
};

type GitHubCommitResponse = {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string | null;
      date: string;
    };
  };
};

type GitHubLanguagesResponse = Record<string, number>;

type GitHubContributorResponse = {
  login: string;
  contributions: number;
};

type GitHubContentEntry = {
  name: string;
  path: string;
  size: number;
  type: "file" | "dir" | "symlink" | "submodule";
  download_url: string | null;
};

export class GitHubRepoError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "GitHubRepoError";
  }
}

export function parseGitHubRepoUrl(repoUrl: string): {
  owner: string;
  repo: string;
} {
  let parsed: URL;
  try {
    parsed = new URL(repoUrl);
  } catch {
    throw new Error("Please provide a valid GitHub repository URL.");
  }

  if (
    parsed.hostname !== "github.com" &&
    parsed.hostname !== "www.github.com"
  ) {
    throw new Error("URL must be from github.com.");
  }

  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length < 2) {
    throw new Error("Repository URL must include owner and repo name.");
  }

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/, "");

  if (!owner || !repo) {
    throw new Error("Could not parse owner/repo from URL.");
  }

  return { owner, repo };
}

async function fetchGitHubJson<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    const errorMessage =
      response.status === 404
        ? "Repository not found or private."
        : `GitHub API request failed with status ${response.status}.`;
    throw new GitHubRepoError(errorMessage, response.status);
  }

  return (await response.json()) as T;
}

function extensionFromPath(path: string): string {
  const index = path.lastIndexOf(".");
  if (index < 0) {
    return "";
  }
  return path.slice(index).toLowerCase();
}

function isCandidateSourceFile(file: GitHubContentEntry): boolean {
  if (file.type !== "file") {
    return false;
  }
  if (EXCLUDED_FILE_NAMES.has(file.name)) {
    return false;
  }
  const extension = extensionFromPath(file.path);
  return SOURCE_EXTENSIONS.has(extension);
}

function guessLanguageFromPath(path: string): string | null {
  const ext = extensionFromPath(path);
  const map: Record<string, string> = {
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".py": "Python",
    ".go": "Go",
    ".rs": "Rust",
    ".java": "Java",
    ".rb": "Ruby",
    ".php": "PHP",
    ".swift": "Swift",
    ".kt": "Kotlin",
    ".c": "C",
    ".cc": "C++",
    ".cpp": "C++",
    ".h": "C/C++ Header",
    ".hpp": "C++ Header",
    ".cs": "C#",
  };
  return map[ext] ?? null;
}

/**
 * Returns the hour (0–23) in the author's local time when the commit was made.
 * GitHub returns author.date as ISO 8601 with timezone offset when Git is configured
 * (e.g. "2024-01-15T14:30:00-08:00"). The hour before the offset is the author's local hour.
 * If the string is UTC-only ("Z"), we have no timezone info and use UTC.
 */
function getAuthorLocalHour(isoDateString: string): number {
  const match = isoDateString.match(/T(\d{2}):/);
  if (match) {
    return parseInt(match[1], 10);
  }
  const date = new Date(isoDateString);
  return date.getUTCHours();
}

function calculateCommitStats(
  commits: Array<{
    message: string;
    authoredAt: string;
  }>,
): RepoData["commitStats"] {
  if (commits.length === 0) {
    return {
      totalCommits: 0,
      fixCommitRatio: 0,
      lateNightCommitRatio: 0,
      topCommitHours: [],
    };
  }

  const fixCommits = commits.filter((commit) =>
    /^fix(\(|:|\s|$)/i.test(commit.message.trim()),
  ).length;

  const hourCounts = new Map<number, number>();
  let lateNightCount = 0;

  for (const commit of commits) {
    const hour = getAuthorLocalHour(commit.authoredAt);
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
    if (hour >= 0 && hour <= 5) {
      lateNightCount += 1;
    }
  }

  const topCommitHours = Array.from(hourCounts.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    totalCommits: commits.length,
    fixCommitRatio: fixCommits / commits.length,
    lateNightCommitRatio: lateNightCount / commits.length,
    topCommitHours,
  };
}

export async function fetchRepoData(
  owner: string,
  repo: string,
): Promise<RepoData> {
  const [repoMeta, commitsRaw, languagesRaw, contributorsRaw, contentsRaw] =
    await Promise.all([
      fetchGitHubJson<GitHubRepoMetaResponse>(`/repos/${owner}/${repo}`),
      fetchGitHubJson<GitHubCommitResponse[]>(
        `/repos/${owner}/${repo}/commits?per_page=${MAX_COMMITS}`,
      ),
      fetchGitHubJson<GitHubLanguagesResponse>(
        `/repos/${owner}/${repo}/languages`,
      ),
      fetchGitHubJson<GitHubContributorResponse[]>(
        `/repos/${owner}/${repo}/contributors?per_page=20`,
      ),
      fetchGitHubJson<GitHubContentEntry[]>(`/repos/${owner}/${repo}/contents`),
    ]);

  const totalLanguageBytes = Object.values(languagesRaw).reduce(
    (sum, bytes) => sum + bytes,
    0,
  );

  const languages = Object.entries(languagesRaw)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: totalLanguageBytes > 0 ? bytes / totalLanguageBytes : 0,
    }))
    .sort((a, b) => b.bytes - a.bytes);

  const commits = commitsRaw.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message.split("\n")[0] ?? "",
    authoredAt: commit.commit.author.date,
    authorName: commit.commit.author.name,
  }));

  const rootFiles = contentsRaw.map((item) => ({
    name: item.name,
    path: item.path,
    size: item.size,
    type: item.type,
  }));

  const sampledCandidates = contentsRaw
    .filter(isCandidateSourceFile)
    .sort((a, b) => b.size - a.size)
    .slice(0, MAX_FILE_SAMPLES);

  const sampledFiles = await Promise.all(
    sampledCandidates.map(async (file) => {
      const snippet = file.download_url
        ? await fetch(file.download_url, {
            headers: {
              Accept: "application/vnd.github+json",
            },
          })
            .then((res) => (res.ok ? res.text() : ""))
            .catch(() => "")
        : "";

      return {
        path: file.path,
        size: file.size,
        languageGuess: guessLanguageFromPath(file.path),
        snippet: snippet.slice(0, MAX_SNIPPET_CHARS),
      };
    }),
  );

  return {
    owner,
    repo,
    repoMeta: {
      fullName: repoMeta.full_name,
      description: repoMeta.description,
      stars: repoMeta.stargazers_count,
      forks: repoMeta.forks_count,
      openIssues: repoMeta.open_issues_count,
      primaryLanguage: repoMeta.language,
    },
    languages,
    commits,
    commitStats: calculateCommitStats(commits),
    contributors: contributorsRaw.map((contributor) => ({
      login: contributor.login,
      contributions: contributor.contributions,
    })),
    rootFiles,
    sampledFiles,
  };
}

export function isValidGitHubUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    const isGithubHost =
      parsed.hostname === "github.com" || parsed.hostname === "www.github.com";
    const parts = parsed.pathname.split("/").filter(Boolean);
    return isGithubHost && parts.length >= 2;
  } catch {
    return false;
  }
}
