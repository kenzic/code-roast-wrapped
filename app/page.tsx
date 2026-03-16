"use client";

import { createSpecStreamCompiler } from "@json-render/core";
import type { TimelineSpec } from "@json-render/remotion";
import { SubmitEvent, useState } from "react";
import { validateTimelineSpec } from "@/lib/utils";
import { isValidGitHubUrl } from "@/lib/github";
import { WrappedPlayer } from "@/components/wrapped-player";

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [spec, setSpec] = useState<TimelineSpec | null>(null);
  const [rawSpec, setRawSpec] = useState<string>("");
  const [showSpec, setShowSpec] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSpec(null);
    setRawSpec("");

    if (!repoUrl.trim()) {
      setFormError("Please paste a GitHub repository URL.");
      return;
    }

    if (!isValidGitHubUrl(repoUrl.trim())) {
      setFormError(
        "Invalid GitHub URL. Example: https://github.com/vercel/next.js",
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setFormError(data.error ?? "Could not generate roast right now.");
        return;
      }

      if (!response.body) {
        setFormError("Roast stream did not return data.");
        return;
      }

      type RoastTimelineDoc = { spec?: TimelineSpec };
      const compiler = createSpecStreamCompiler<RoastTimelineDoc>();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamDone = false;

      while (!streamDone) {
        const { value, done } = await reader.read();
        streamDone = done;
        if (!value) {
          continue;
        }
        const chunk = decoder.decode(value, { stream: !done });
        compiler.push(chunk);
      }

      const compiledDoc = compiler.getResult();
      const validation = validateTimelineSpec(compiledDoc);

      if (!validation.success || !validation.data) {
        setFormError(validation.error ?? "Generated roast spec was invalid.");
        return;
      }

      setSpec(validation.data);
      setRawSpec(JSON.stringify(validation.data, null, 2));
      setShowSpec(false);
    } catch (error) {
      console.error("Roast generation failed:", error);
      setFormError("Claude API error. Please try again in a minute.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-[0.35em] text-[#cba135]">
          Code Roast
        </p>
        <h1 className="mt-3 text-4xl font-bold text-[#efdfb7] md:text-5xl">
          Wrapped-style repo roast videos
        </h1>
        <p className="mt-3 text-[#e7d7ad]">
          Drop in a public GitHub repository URL and get your brutally honest
          highlight reel.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-[#37654b]/80 bg-[#10251c]/85 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur md:p-6"
      >
        <label htmlFor="repo-url" className="mb-2 block text-sm text-[#efdfb7]">
          GitHub repo URL
        </label>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            id="repo-url"
            name="repo-url"
            type="url"
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder="https://github.com/owner/repo"
            className="w-full rounded-md border border-[#37654b] bg-[#1c3a2c] px-4 py-3 text-[#efdfb7] outline-none ring-[#cba135]/40 placeholder:text-[#d4c296] focus:ring-2"
            aria-label="GitHub repository URL"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="rounded-md bg-[#cba135] px-6 py-3 font-semibold text-[#1c3a2c] transition hover:bg-[#dfb955] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Analyzing your crimes..." : "Generate roast"}
          </button>
        </div>

        {formError ? (
          <p className="mt-3 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {formError}
          </p>
        ) : null}
      </form>

      {isLoading || spec ? (
        <section className="mt-8 rounded-xl border border-[#37654b]/80 bg-[#10251c]/85 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur md:p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#efdfb7]">
            Your Roast Video
          </h2>
          <div className="overflow-hidden rounded-lg border border-[#37654b]">
            {isLoading && !spec ? (
              <div
                className="flex aspect-video w-full items-center justify-center bg-[#1c3a2c]"
                aria-label="Generating roast video"
              >
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="h-10 w-10 animate-spin rounded-full border-2 border-[#37654b] border-t-[#cba135]"
                    aria-hidden
                  />
                  <p className="text-sm text-[#efdfb7]">
                    Generating your roast...
                  </p>
                </div>
              </div>
            ) : spec?.composition ? (
              <WrappedPlayer spec={spec} />
            ) : null}
          </div>

          {spec ? (
            <>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setShowSpec((current) => !current)}
                  className="rounded-md border border-[#37654b] px-3 py-2 text-sm text-[#efdfb7] hover:border-[#cba135] hover:text-[#cba135]"
                >
                  {showSpec ? "Hide Spec" : "View Spec"}
                </button>
              </div>

              {showSpec ? (
                <pre className="mt-4 max-h-[420px] overflow-auto rounded-md border border-[#37654b] bg-[#0d1f17] p-4 text-xs text-[#efdfb7]">
                  {rawSpec}
                </pre>
              ) : null}
            </>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
