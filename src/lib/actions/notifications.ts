"use server";

import { prisma } from "../prisma";
import { auth } from "../auth";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return { items: [], unreadCount: 0 };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { lastSeenNotificationsAt: true },
  });

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [skills, sources] = await Promise.all([
    prisma.skill.findMany({
      where: { createdAt: { gte: since } },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.source.findMany({
      where: { createdAt: { gte: since } },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const lastSeen = user?.lastSeenNotificationsAt ?? since;

  const items = [
    ...skills.map((s) => ({
      id: s.id,
      type: "skill" as const,
      name: s.name,
      slug: s.slug,
      author: s.author.name,
      createdAt: s.createdAt,
      unread: s.createdAt > lastSeen,
    })),
    ...sources.map((s) => ({
      id: s.id,
      type: "source" as const,
      name: s.title,
      slug: null,
      author: s.author.name,
      createdAt: s.createdAt,
      unread: s.createdAt > lastSeen,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const unreadCount = items.filter((i) => i.unread).length;

  return { items, unreadCount };
}

export async function markNotificationsSeen() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastSeenNotificationsAt: new Date() },
  });
}
