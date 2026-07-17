"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Turnstile from "react-turnstile";
import { toast } from "sonner";
import type { ClaimResponse, ClaimSuccessResponse } from "@/types";

interface ClaimFormProps {
  onSuccess: (data: ClaimSuccessResponse["data"]) => void;
}

export function ClaimForm({ onSuccess }: ClaimFormProps) {
  const [address, setAddress] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasTurnstile = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const isDisabled = isLoading || (hasTurnstile ? !turnstileToken : false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!address.trim()) {
        toast.error("Enter a wallet address to continue");
        return;
      }

      if (hasTurnstile && !turnstileToken) {
        toast.error("Complete the verification first");
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch("/api/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: address.trim(),
            turnstileToken: turnstileToken || "localnet-bypass",
          }),
        });

        const data: ClaimResponse = await res.json();

        if (data.success) {
          onSuccess(data.data);
          toast.success("Tokens sent to your wallet", {
            description: `Tx ${data.data.txHash.slice(0, 10)}...`,
          });
          setAddress("");
          setTurnstileToken(null);
        } else {
          toast.error(data.error || "Claim failed");
        }
      } catch {
        toast.error("Unable to connect. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [address, turnstileToken, hasTurnstile, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Address input */}
      <div className="space-y-2">
        <label
          htmlFor="wallet-address"
          className="block text-[13px] font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Wallet address
        </label>
        <div
          className="relative rounded-lg transition-all duration-200"
          style={{
            boxShadow: isFocused
              ? "0 0 0 1px var(--accent), 0 0 0 4px var(--accent-muted)"
              : "0 0 0 1px var(--border-default)",
          }}
        >
          <input
            id="wallet-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="0x..."
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
            className="w-full h-11 px-3.5 rounded-lg text-sm font-mono bg-transparent outline-none disabled:opacity-40 disabled:cursor-not-allowed placeholder:opacity-30"
            style={{
              color: "var(--text-primary)",
              background: "var(--bg-input)",
            }}
          />
        </div>
      </div>

      {/* Turnstile */}
      {hasTurnstile && (
        <div className="flex justify-center py-1">
          <Turnstile
            sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onVerify={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            theme="dark"
          />
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isDisabled}
        className="relative w-full h-11 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 overflow-hidden hover:enabled:brightness-110 hover:enabled:shadow-lg active:enabled:scale-[0.98]"
        style={{
          background: isDisabled ? "var(--border-default)" : "var(--accent)",
          color: isDisabled ? "var(--text-secondary)" : "#fff",
          boxShadow: "0 0 0 0 var(--accent)",
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.boxShadow = "0 0 0 4px var(--accent-muted)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 0 0 0 var(--accent)";
        }}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center gap-2"
            >
              <LoadingDots />
              Processing
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              Request tokens
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </form>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1 h-1 rounded-full bg-white/70"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}
