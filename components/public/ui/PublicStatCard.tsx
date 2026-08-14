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
        rounded-2xl
        border border-slate-200
        bg-slate-50
        p-5

        text-center
        text-slate-950
        transition-shadow duration-300
        hover:shadow-sm
      "
    >
      <div className="text-4xl font-black tracking-tight">
        {value}
      </div>

      <div className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
    </div>
  );
}
