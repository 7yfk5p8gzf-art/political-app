import type { ReactNode } from "react";

export default function PublicPageShell({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(59,130,246,0.14), transparent 32%), radial-gradient(circle at top right, rgba(168,85,247,0.12), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        padding: "32px 16px 64px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1120px",
          margin: "0 auto",
        }}
      >
        {children}
      </div>
    </main>
  );
}