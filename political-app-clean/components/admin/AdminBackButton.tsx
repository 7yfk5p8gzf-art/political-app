"use client";

type AdminBackButtonProps = {
  href?: string;
  label?: string;
};

export default function AdminBackButton({
  href = "/admin",
  label = "← Back to Admin Dashboard",
}: AdminBackButtonProps) {
  return (
    <a
      href={href}
      className="inline-flex items-center rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
    >
      {label}
    </a>
  );
}