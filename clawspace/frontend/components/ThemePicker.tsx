"use client";

const themes = ["#1DA1F2", "#8B5CF6", "#14B8A6", "#F97316", "#EF4444"];

export default function ThemePicker({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <p className="text-sm text-muted">Profile theme</p>
      <div className="mt-3 flex items-center gap-3">
        {themes.map((theme) => (
          <button
            key={theme}
            onClick={() => onChange(theme)}
            className={`h-11 w-11 rounded-full border-2 active:scale-95 transition-transform ${
              value === theme ? "border-white" : "border-transparent"
            }`}
            style={{ backgroundColor: theme }}
            aria-label={`Set theme ${theme}`}
          />
        ))}
      </div>
    </div>
  );
}
