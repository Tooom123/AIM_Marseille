"use client";

import type { ReactNode } from "react";

export function Card({
  children, className = "", pad = true,
}: { children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgb(18_51_58/.04)] ${pad ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children, hint, action,
}: { children: ReactNode; hint?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{children}</h2>
        {hint && <p className="mt-0.5 text-sm text-ink-soft">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

const TONES = {
  turquoise: "bg-turquoise/12 text-[#0E7C8C] border-turquoise/25",
  rose: "bg-rose/12 text-[#C22B52] border-rose/25",
  neutral: "bg-cream text-ink-soft border-line",
  ink: "bg-ink text-white border-ink",
} as const;

export function Badge({
  children, tone = "neutral", className = "",
}: { children: ReactNode; tone?: keyof typeof TONES; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "rose" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  full?: boolean;
  type?: "button" | "submit";
  className?: string;
};

export function Button({
  children, onClick, variant = "primary", size = "md",
  disabled, full, type = "button", className = "",
}: BtnProps) {
  const variants = {
    primary: "bg-turquoise text-white hover:brightness-95 shadow-sm",
    rose: "bg-rose text-white hover:brightness-95 shadow-sm",
    outline: "border border-line bg-surface text-ink hover:bg-cream",
    ghost: "text-ink-soft hover:bg-cream hover:text-ink",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${sizes[size]} ${full ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label, children, hint,
}: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none transition placeholder:text-ink-soft/60 focus:border-turquoise focus:ring-2 focus:ring-turquoise/25";

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-cream/40 p-8 text-center">
      <p className="font-medium">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">{children}</p>}
    </div>
  );
}

export function Stat({
  value, label, tone = "ink",
}: { value: ReactNode; label: string; tone?: "ink" | "turquoise" | "rose" }) {
  const colors = { ink: "text-ink", turquoise: "text-[#0E7C8C]", rose: "text-[#C22B52]" };
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className={`text-2xl font-semibold tabular-nums ${colors[tone]}`}>{value}</div>
      <div className="mt-0.5 text-xs text-ink-soft">{label}</div>
    </div>
  );
}

/** Saisie de tags : le socle de l'onboarding (compétences, hobbies, besoins). */
export function TagInput({
  value, onChange, placeholder, suggestions = [],
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const add = (raw: string) => {
    const v = raw.trim().replace(/,$/, "");
    if (v && !value.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...value, v]);
  };
  const free = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()));

  return (
    <div>
      <div className={`${inputClass} flex min-h-11 flex-wrap items-center gap-1.5 py-2`}>
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-turquoise/14 px-2 py-1 text-xs font-medium text-[#0E7C8C]"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-[#0E7C8C]/60 transition hover:text-[#0E7C8C]"
              aria-label={`Retirer ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="min-w-24 flex-1 bg-transparent text-sm outline-none"
          placeholder={value.length ? "" : placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(e.currentTarget.value);
              e.currentTarget.value = "";
            } else if (e.key === "Backspace" && !e.currentTarget.value && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={(e) => { add(e.currentTarget.value); e.currentTarget.value = ""; }}
        />
      </div>
      {free.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {free.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink-soft transition hover:border-turquoise hover:text-ink"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
