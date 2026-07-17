"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { ClaimSuccessResponse } from "@/types";

interface TransactionReceiptProps {
  data: ClaimSuccessResponse["data"];
}

export function TransactionReceipt({ data }: TransactionReceiptProps) {
  const truncate = (str: string) => {
    if (str.length <= 14) return str;
    return `${str.slice(0, 6)}...${str.slice(-4)}`;
  };

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  }, []);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const rows: { label: string; value: string; full: string; isLink?: boolean; href?: string }[] = [
    {
      label: "Tx hash",
      value: truncate(data.txHash),
      full: data.txHash,
      isLink: true,
      href: data.explorerUrl,
    },
    { label: "From", value: truncate(data.from), full: data.from },
    { label: "To", value: truncate(data.to), full: data.to },
    { label: "Amount", value: `${data.amount} ARM`, full: data.amount },
    { label: "Time", value: formatTime(data.timestamp), full: formatTime(data.timestamp) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-lg overflow-hidden"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Success header stripe */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          background: "var(--success-muted)",
          borderBottom: "1px solid rgba(52, 211, 153, 0.1)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--success)" }}
          />
          <span className="text-xs font-medium" style={{ color: "var(--success)" }}>
            Transaction confirmed
          </span>
        </div>
        <a
          href={data.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
        >
          View in explorer
        </a>
      </div>

      {/* Data rows */}
      <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-4 py-2.5"
          >
            <span
              className="text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              {row.label}
            </span>
            {row.isLink ? (
              <a
                href={row.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono transition-colors"
                style={{ color: "var(--accent)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--accent)")}
              >
                {row.value}
              </a>
            ) : row.label === "From" || row.label === "To" ? (
              <button
                type="button"
                onClick={() => copyToClipboard(row.full, row.label)}
                className="text-xs font-mono transition-colors cursor-pointer bg-transparent border-0 p-0"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                title={`Copy ${row.label.toLowerCase()} address`}
              >
                {row.value}
              </button>
            ) : (
              <span
                className="text-xs font-mono"
                style={{ color: "var(--text-primary)" }}
              >
                {row.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
