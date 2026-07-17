"use client";

import { NetworkBadge } from "./NetworkBadge";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b" style={{ borderColor: "var(--border-subtle)", background: "rgba(5, 10, 20, 0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: "var(--text-primary)" }}>
            Armchain
          </span>
          <span className="text-[13px] font-normal" style={{ color: "var(--text-tertiary)" }}>
            /
          </span>
          <span className="text-[13px] font-normal" style={{ color: "var(--text-secondary)" }}>
            Faucet
          </span>
        </div>
        <NetworkBadge />
      </div>
    </header>
  );
}
