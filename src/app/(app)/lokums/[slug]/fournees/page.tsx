import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FourneesClient } from "./FourneesClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function FourneesPage({ params }: Props) {
  const { slug } = await params;

  const lokum = await prisma.skill.findUnique({
    where: { slug },
    include: {
      versions: { orderBy: { version: "desc" } },
    },
  });

  if (!lokum) notFound();

  return (
    <div>
      <Link
        href={`/lokums/${slug}`}
        className="mb-4 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour a {lokum.name}
      </Link>

      <h1 className="font-display text-3xl text-text-primary">
        Historique des fournees
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {lokum.versions.length} fournee{lokum.versions.length !== 1 ? "s" : ""}{" "}
        pour {lokum.name}
      </p>

      <div className="mt-8">
        <FourneesClient
          fournees={lokum.versions.map((v) => ({
            ...v,
            createdAt: v.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
