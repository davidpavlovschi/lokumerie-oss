import Link from "next/link";
import { FlavorBadge } from "@/components/ui/FlavorBadge";
import type { Kouti, User, KoutiSkill, Skill } from "@prisma/client";

interface KoutiTableProps {
  koutis: (Kouti & {
    author: Pick<User, "name" | "image">;
    skills: (KoutiSkill & { skill: Pick<Skill, "name" | "flavor"> })[];
    _count: { skills: number };
  })[];
}

export function KoutiTable({ koutis }: KoutiTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Name</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Author</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Skills</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Flavors</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Visibility</th>
          </tr>
        </thead>
        <tbody>
          {koutis.map((kouti) => {
            const flavors = [...new Set(kouti.skills.map((ks) => ks.skill.flavor))];
            return (
              <tr key={kouti.id} className="border-b border-border last:border-0 transition-colors hover:bg-overlay">
                <td className="px-4 py-3">
                  <Link href={`/koutis/${kouti.slug}`} className="text-sm font-medium text-text-primary hover:text-accent transition-colors">
                    {kouti.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">{kouti.author.name}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{kouti._count.skills}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {flavors.slice(0, 3).map((f) => (
                      <FlavorBadge key={f} flavor={f} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-text-muted">{kouti.visibility}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
