/**
 * File: src/legacy/labs/shared/ThreadButton.tsx
 * Description: The quiet text button the lab layouts use for "more", "less", "reset" and similar.
 */
"use client";

interface ThreadButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export default function ThreadButton({ onClick, children }: ThreadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 self-start text-xs font-medium text-[var(--foreground)]/50 transition-colors hover:text-[var(--theme-primary-glow)]"
    >
      {children}
    </button>
  );
}
