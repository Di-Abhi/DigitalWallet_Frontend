interface Props { text: string; }

export function AuthDivider({ text }: Props) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[var(--border)]" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-[var(--bg)] px-3 text-[var(--text-muted)]">{text}</span>
      </div>
    </div>
  );
}
