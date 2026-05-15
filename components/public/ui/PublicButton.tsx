import type { ReactNode } from "react";
import { publicStyles } from "@/lib/publicStyles";

type PublicButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
};

export default function PublicButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
}: PublicButtonProps) {
  const styleClass =
    variant === "primary"
      ? publicStyles.buttonPrimary
      : publicStyles.buttonSecondary;

  if (href) {
    return (
      <a
        href={href}
        className="
inline-flex items-center justify-center rounded-xl
bg-slate-900 px-4 py-2 text-sm font-black text-white
transition-all hover:scale-[1.02] hover:bg-slate-700
dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200
"
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${styleClass} ${className}`}
    >
      {children}
    </button>
  );
}