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
        className={`${styleClass} ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styleClass} ${className}`}
    >
      {children}
    </button>
  );
}
