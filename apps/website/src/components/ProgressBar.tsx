/** Accessible progress bar used by the development-projects list. */
export function ProgressBar({ pct, status }: { pct: number; status?: string }) {
  const value = Math.max(0, Math.min(100, Math.round(Number.isFinite(pct) ? pct : 0)));
  const modifier =
    status === "completed" || value >= 100 ? " site-bar__fill--done" : value === 0 ? " site-bar__fill--idle" : "";
  return (
    <div className="site-progress">
      <div
        className="site-bar"
        style={{ flex: 1 }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Project completion"
      >
        <div className={`site-bar__fill${modifier}`} style={{ width: `${value}%` }} />
      </div>
      <span className="site-progress__pct">{value}%</span>
    </div>
  );
}
