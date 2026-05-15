type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function PublicInput({
  value,
  onChange,
  placeholder,
}: Props) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="
        w-full rounded-2xl
        border border-white/10
        bg-white/80 px-5 py-4

        text-base text-slate-950
        outline-none

        shadow-[0_10px_35px_rgba(15,23,42,0.06)]
        backdrop-blur-xl

        transition-all duration-300

        placeholder:text-slate-400

        focus:border-indigo-400
        focus:ring-4
        focus:ring-indigo-500/10

        dark:bg-slate-950/50
        dark:text-white
        dark:placeholder:text-slate-500
      "
    />
  );
}