/**
 * POST /api/roast: fetches repo data, then streams a roast timeline spec from Claude
 * using the catalog prompt from lib/catalog (server-safe, no Remotion).
 */
import { streamText } from "ai";
import { getCatalogPrompt } from "@/lib/catalog";
import {
  fetchRepoData,
  GitHubRepoError,
  parseGitHubRepoUrl,
} from "@/lib/github";

type RoastRequestBody = {
  repoUrl?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RoastRequestBody;
    const repoUrl = body.repoUrl?.trim();
    if (!repoUrl) {
      return Response.json({ error: "repoUrl is required." }, { status: 400 });
    }

    const { owner, repo } = parseGitHubRepoUrl(repoUrl);
    const repoData = await fetchRepoData(owner, repo);

    const sysPrompt = getCatalogPrompt();

    const result = streamText({
      model: "anthropic/claude-sonnet-4-6",
      system: `${sysPrompt}`,
      prompt: `Repo data JSON:\n${JSON.stringify(repoData, null, 2)}`,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    if (error instanceof GitHubRepoError) {
      const status = error.status === 404 ? 404 : 502;
      return Response.json(
        { error: error.message || "Failed to fetch repository data." },
        { status },
      );
    }

    if (error instanceof Error) {
      if (
        error.message.includes("valid GitHub repository URL") ||
        error.message.includes("github.com") ||
        error.message.includes("owner and repo")
      ) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      console.error("Claude roast generation error:", error);
      return Response.json(
        { error: "Claude failed to generate a roast. Please try again." },
        { status: 500 },
      );
    }

    console.error("Unknown roast API error:", error);
    return Response.json(
      { error: "Unexpected error occurred." },
      { status: 500 },
    );
  }
}
