import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { AdapterUser } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const baseAdapter = PrismaAdapter(prisma);
const providers = [
  ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? [GitHub] : []),
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google] : []),
];

function slugifyUsername(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function generateUniqueUsername(base: string): Promise<string> {
  const slug = slugifyUsername(base);
  const existing = await prisma.user.findUnique({ where: { username: slug } });
  if (!existing) return slug;
  for (let i = 2; i < 100; i++) {
    const candidate = `${slug}${i}`;
    const taken = await prisma.user.findUnique({ where: { username: candidate } });
    if (!taken) return candidate;
  }
  return `${slug}-${Date.now().toString(36)}`;
}

function getProfileString(profile: unknown, key: string): string {
  if (typeof profile !== "object" || profile === null || !(key in profile)) return "";
  const value = (profile as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

// Bridges profile → createUser for username extraction
const pendingUsername = new Map<string, string>();

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Trust the X-Forwarded-* headers that Caddy sets in production. Without
  // this, NextAuth v5 derives the OAuth redirect_uri from localhost:3000 and
  // Google bounces the user back to a broken localhost URL.
  trustHost: true,
  adapter: {
    ...baseAdapter,
    createUser: async (data: AdapterUser) => {
      const email = data.email?.toLowerCase();
      const usernameHint = email ? pendingUsername.get(email) : undefined;
      if (usernameHint) pendingUsername.delete(email);
      const base = usernameHint || data.name || email?.split("@")[0] || "user";
      const username = await generateUniqueUsername(base);

      const created = await prisma.user.create({
        data: {
          ...data,
          username,
        },
      });
      return created as AdapterUser;
    },
  },
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Extract username hint from provider profile
      if (account?.provider === "github" && profile) {
        const login = getProfileString(profile, "login").toLowerCase();
        if (login) pendingUsername.set(user.email.toLowerCase(), login);
      } else if (account?.provider === "google" && user.email) {
        const prefix = user.email.split("@")[0];
        if (prefix) pendingUsername.set(user.email.toLowerCase(), prefix);
      }

      // Set username on existing users who don't have one yet
      if (user.id) {
        const existingUser = await prisma.user.findUnique({ where: { id: user.id }, select: { username: true } });
        if (existingUser && !existingUser.username) {
          let base: string;
          if (account?.provider === "github" && profile) {
            base = getProfileString(profile, "login").toLowerCase();
          } else {
            base = user.email!.split("@")[0];
          }
          if (base) {
            const username = await generateUniqueUsername(base);
            await prisma.user.update({ where: { id: user.id }, data: { username } });
          }
        }
      }

      if (allowedEmails.length === 0) return true;
      return allowedEmails.includes(user.email.toLowerCase());
    },
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
