"use client";

const NETWORK = process.env.NEXT_PUBLIC_CHAIN_NAME || "Testnet";

export function NetworkBadge() {
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium"
      style={{
        background: "var(--accent-muted)",
        color: "var(--accent)",
        border: "1px solid var(--accent-subtle)",
      }}
    >
      <span
        className="block w-1.5 h-1.5 rounded-full"
        style={{ background: "var(--accent)" }}
      />
      {NETWORK}
    </div>
  );
}
