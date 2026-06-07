"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { auth } from "../auth";

export async function generateApiKey() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  const key = "lok_" + randomBytes(24).toString("hex");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { apiKey: key },
  });

  revalidatePath("/settings");
  return key;
}

export async function authorizeCliSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  // Reuse existing key or generate a new one
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { apiKey: true },
  });

  if (user?.apiKey) return user.apiKey;

  const key = "lok_" + randomBytes(24).toString("hex");
  await prisma.user.update({
    where: { id: session.user.id },
    data: { apiKey: key },
  });

  revalidatePath("/settings");
  return key;
}

export async function revokeApiKey() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { apiKey: null },
  });

  revalidatePath("/settings");
}
