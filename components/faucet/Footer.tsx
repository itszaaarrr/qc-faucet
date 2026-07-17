"use client";

export function Footer() {
  return (
    <footer
      className="border-t py-6"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Armchain — The Quantum Resistant L1
        </span>
        <div className="flex items-center gap-4">
          <a
            href="https://armchain.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
          >
            Website
          </a>
          <a
            href="https://docs.armchain.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
          >
            Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
