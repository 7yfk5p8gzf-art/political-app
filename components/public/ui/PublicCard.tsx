import type { ReactNode } from "react";
import { publicStyles } from "@/lib/publicStyles";

type PublicCardProps = {
  children: ReactNode;
  className?: string;
};

export default function PublicCard({
  children,
  className = "",
}: PublicCardProps) {
  return (
    <div className={`${publicStyles.card} ${className}`}>
      {children}
    </div>
  );
}