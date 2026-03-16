const CARD_URL = "https://card.christophermckenzie.com/";
const MEDIUM_URL = "https://medium.com/@kenzic";
const GITHUB_REPO_URL = "https://github.com/kenzic/code-roast-wrapped";

const linkClass =
  "text-sm text-[#efdfb7] underline decoration-[#37654b] underline-offset-2 transition hover:text-[#cba135] hover:decoration-[#cba135] focus:outline-none focus:ring-2 focus:ring-[#cba135]/40 focus:ring-offset-2 focus:ring-offset-[#10251c]";

export function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      className="border-t border-[#37654b]/80 bg-[#10251c] px-6 py-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-0">
        <nav
          aria-label="Footer links"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1"
        >
          <a
            href={MEDIUM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            📝 Medium
          </a>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            🐙 GitHub
          </a>
        </nav>
        <p className="text-sm text-[#e7d7ad]">
          Built with ❤️ by{" "}
          <a
            href={CARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Chris Mckenzie
          </a>{" "}
          in NYC
        </p>
      </div>
    </footer>
  );
}
