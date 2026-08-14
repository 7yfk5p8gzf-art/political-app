type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  type?: string;
};

export default function PublicInput({
  value,
  onChange,
  placeholder,
  label,
  id,
  type = "search",
}: Props) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span> : null}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label ? undefined : placeholder}
        className="
        w-full rounded-2xl
        border border-slate-300
        bg-white px-4 py-3

        text-base text-slate-950
        outline-none

        shadow-sm

        transition-all duration-300

        placeholder:text-slate-400

        focus:border-slate-500
        focus:ring-4
        focus:ring-amber-400/20

        dark:bg-slate-950/50
        dark:text-white
        dark:placeholder:text-slate-500
      "
      />
    </label>
  );
}
