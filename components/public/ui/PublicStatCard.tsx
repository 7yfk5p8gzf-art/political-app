type Props = {
  value: string | number;
  label: string;
};

export default function PublicStatCard({
  value,
  label,
}: Props) {
  return (
    <div
      className="
        rounded-3xl
        border border-white/10
        bg-slate-900/95
        p-6

        text-center
        text-white

        shadow-[0_20px_50px_rgba(15,23,42,0.25)]

        transition-all duration-300
        hover:scale-[1.02]
      "
    >
      <div className="text-4xl font-black tracking-tight">
        {value}
      </div>

      <div className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
    </div>
  );
}