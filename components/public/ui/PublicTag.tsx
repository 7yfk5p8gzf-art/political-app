import type { ReactNode } from "react";
import { publicStyles } from "@/lib/publicStyles";

type PublicTagProps = {
  children: ReactNode;
  href?: string;
  className?: string;
};

export default function PublicTag({
  children,
  href,
  className = "",
}: PublicTagProps) {
  if (href) {
    return (
      <a
        href={href}
        className={`${publicStyles.tag} ${className}`}
        style={{ textDecoration: "none" }}
      >
        {children}
      </a>
    );
  }

  return (
    <span className={`${publicStyles.tag} ${className}`}>
      {children}
    </span>
  );
}