"use client";

export function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Dot grid pattern */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="var(--border-subtle)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-dots)" />
      </svg>

      {/* Top-center glow */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(79, 142, 250, 0.04) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
