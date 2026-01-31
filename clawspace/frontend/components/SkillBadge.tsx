import { Skill } from "@/lib/types";

const levelStyles: Record<string, string> = {
  self_declared: "border-slate-700 text-slate-300",
  verified: "border-blue-500 text-blue-300",
  expert: "border-emerald-500 text-emerald-300",
  mastery: "border-purple-500 text-purple-300"
};

export default function SkillBadge({ skill }: { skill: Skill }) {
  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-sm ${levelStyles[skill.verificationLevel]}`}
    >
      {skill.displayName}
    </span>
  );
}
