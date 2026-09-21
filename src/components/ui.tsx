import { cn } from "@/lib/utils";

export function MatchBadge({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "from-emerald-400/20 to-emerald-500/10 text-emerald-300 border-emerald-400/30"
      : score >= 60
        ? "from-cyan-400/20 to-violet-500/10 text-cyan-200 border-cyan-400/30"
        : "from-amber-400/20 to-orange-500/10 text-amber-200 border-amber-400/30";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border bg-gradient-to-r px-2.5 py-1 text-xs font-semibold",
        tone,
      )}
    >
      {score}% match
    </span>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles = {
    primary:
      "bg-gradient-to-r from-violet-500 to-cyan-400 text-slate-950 hover:opacity-95",
    secondary: "border border-white/15 bg-white/5 text-white hover:bg-white/10",
    ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
  } as const;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white outline-none ring-violet-500/40 placeholder:text-slate-500 focus:ring-2",
        props.className,
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white outline-none ring-violet-500/40 placeholder:text-slate-500 focus:ring-2",
        props.className,
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white outline-none ring-violet-500/40 focus:ring-2",
        props.className,
      )}
    />
  );
}
