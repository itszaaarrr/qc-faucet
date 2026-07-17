"use client";

export function Logo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Shield / diamond shape — represents quantum resistance */}
      <path
        d="M14 2L3 8.5V14.5C3 20.3 7.6 25.6 14 27C20.4 25.6 25 20.3 25 14.5V8.5L14 2Z"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Inner lattice — represents the chain structure */}
      <path
        d="M14 8V20M9 11L14 14L19 11M9 17L14 14L19 17"
        stroke="var(--accent)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}
