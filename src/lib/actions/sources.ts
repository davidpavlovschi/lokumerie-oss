"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { auth } from "../auth";
import { computeLinksForSource } from "./links";

function detectSourceType(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) return "youtube";
    if (u.hostname.includes("twitter.com") || u.hostname.includes("x.com")) return "twitter";
    if (u.hostname.includes("github.com")) return "github";
    return "other";
  } catch {
    return "other";
  }
}

async function assertOwner(sourceId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  const source = await prisma.source.findUnique({
    where: { id: sourceId },
    select: { authorId: true },
  });
  if (!source) throw new Error("Source introuvable");
  if (source.authorId !== session.user.id) throw new Error("Non autorise");

  return session.user.id;
}

export async function quickAddSource(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  const url = (formData.get("url") as string)?.trim();
  if (!url) throw new Error("URL requis");

  const title = (formData.get("title") as string)?.trim() || undefined;
  const description = (formData.get("description") as string)?.trim() || undefined;
  const ogImage = (formData.get("ogImage") as string)?.trim() || undefined;
  const tagsRaw = formData.get("tags") as string | null;
  const tags = tagsRaw ? tagsRaw.split(",").filter(Boolean) : [];

  const sourceType = detectSourceType(url);

  let fallbackTitle = url;
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "").split("/").pop() || "";
    const clean = path.replace(/[-_]/g, " ").replace(/\.\w+$/, "");
    fallbackTitle = clean.charAt(0).toUpperCase() + clean.slice(1) || u.hostname;
  } catch {}

  const source = await prisma.source.create({
    data: {
      title: title || fallbackTitle,
      url,
      sourceType,
      description,
      ogImage,
      tags,
      authorId: session.user.id,
    },
  });

  computeLinksForSource(source.id).catch(() => {});
  revalidatePath("/garde-manger");
}

export async function quickAddBillet(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  const content = (formData.get("content") as string)?.trim();
  if (!content) throw new Error("Contenu requis");

  const title = (formData.get("title") as string)?.trim() ||
    content.slice(0, 60).replace(/\n/g, " ") + (content.length > 60 ? "..." : "");
  const origin = (formData.get("origin") as string)?.trim() || null;
  const tagsRaw = formData.get("tags") as string | null;
  const tags = tagsRaw ? tagsRaw.split(",").filter(Boolean) : [];

  const billet = await prisma.source.create({
    data: {
      title,
      url: null,
      sourceType: "billet",
      content,
      origin,
      tags,
      authorId: session.user.id,
    },
  });

  computeLinksForSource(billet.id).catch(() => {});
  revalidatePath("/garde-manger");
}

export async function updateSource(sourceId: string, formData: FormData) {
  await assertOwner(sourceId);

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() ?? "";
  const content = (formData.get("content") as string)?.trim();
  const origin = (formData.get("origin") as string)?.trim();
  const tags = (formData.get("tags") as string || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  await prisma.source.update({
    where: { id: sourceId },
    data: {
      ...(title && { title }),
      description: description || null,
      ...(content !== undefined && { content: content || null }),
      ...(origin !== undefined && { origin: origin || null }),
      tags,
    },
  });

  computeLinksForSource(sourceId).catch(() => {});
  revalidatePath("/garde-manger");
}

export async function deleteSource(sourceId: string) {
  await assertOwner(sourceId);

  await prisma.source.delete({ where: { id: sourceId } });
  revalidatePath("/garde-manger");
}
