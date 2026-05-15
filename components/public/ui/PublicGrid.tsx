import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  columns?: "2" | "3" | "4";
};

export default function PublicGrid({
  children,
  columns = "3",
}: Props) {
  const cols =
    columns === "2"
      ? "md:grid-cols-2"
      : columns === "4"
        ? "md:grid-cols-2 xl:grid-cols-4"
        : "md:grid-cols-2 xl:grid-cols-3";

  return <div className={`grid gap-6 ${cols}`}>{children}</div>;
}