"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Header } from "@/components/faucet/Header";
import { ClaimForm } from "@/components/faucet/ClaimForm";
import { TransactionReceipt } from "@/components/faucet/TransactionReceipt";
import { Footer } from "@/components/faucet/Footer";
import { GridBackground } from "@/components/faucet/GridBackground";
import type { ClaimSuccessResponse } from "@/types";

export default function Home() {
  const [latestClaim, setLatestClaim] = useState<ClaimSuccessResponse["data"] | null>(null);

  const handleClaimSuccess = useCallback((data: ClaimSuccessResponse["data"]) => {
    setLatestClaim(data);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      <GridBackground />
      <Header />

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-start justify-center pt-28 pb-16 px-4">
        <div className="w-full max-w-[460px] space-y-6">
          {/* Hero text */}
          <div className="space-y-2">
            <h1
              className="text-[22px] font-semibold tracking-[-0.02em]"
              style={{ color: "var(--text-primary)" }}
            >
              Request test tokens
            </h1>
            <p
              className="text-[14px] leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Get ARM tokens to cover gas fees on Armchain&apos;s quantum-resistant
              L1 EVM network.
            </p>
          </div>

          {/* Claim card */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <ClaimForm onSuccess={handleClaimSuccess} />
          </div>

          {/* Latest transaction */}
          <AnimatePresence>
            {latestClaim && (
              <div className="space-y-3">
                <span
                  className="block text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Latest transaction
                </span>
                <TransactionReceipt data={latestClaim} />
              </div>
            )}
          </AnimatePresence>

          {/* Info bar */}
          <div
            className="flex items-center gap-3 rounded-lg px-4 py-3"
            style={{
              background: "var(--accent-muted)",
              border: "1px solid var(--accent-subtle)",
            }}
          >
            <div
              className="shrink-0 w-1 h-8 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Faucet tokens hold no real value and are intended solely for
              development and testing purposes.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
