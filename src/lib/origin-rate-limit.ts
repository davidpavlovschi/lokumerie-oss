import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };
type Limit = { name: string; max: number; windowMs: number };

const staticAssetPattern = /\.(?:avif|bmp|css|gif|ico|jpeg|jpg|js|json|map|mp3|mp4|ogg|otf|pdf|png|svg|txt|webm|webmanifest|webp|woff|woff2|xml)$/i;
const staticPrefixes = ["/_next", "/assets", "/blog/images", "/fonts", "/guide/images", "/images", "/img", "/og"];
const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
const globalForRateLimit = globalThis as typeof globalThis & { __originRateLimitStore?: Map<string, Bucket> };
const store = globalForRateLimit.__originRateLimitStore ?? new Map<string, Bucket>();
globalForRateLimit.__originRateLimitStore = store;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("true-client-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function shouldSkip(pathname: string): boolean {
  return pathname === "/api/health" || staticPrefixes.some((prefix) => pathname.startsWith(prefix)) || staticAssetPattern.test(pathname);
}

function hitLimit(key: string, limit: Limit) {
  const now = Date.now();
  const storeKey = `${limit.name}:${key}`;
  const current = store.get(storeKey);
  if (!current || current.resetAt <= now) {
    const resetAt = now + limit.windowMs;
    store.set(storeKey, { count: 1, resetAt });
    return { blocked: false, resetAt };
  }
  if (current.count >= limit.max) return { blocked: true, resetAt: current.resetAt };
  current.count += 1;
  store.set(storeKey, current);
  return { blocked: false, resetAt: current.resetAt };
}

function tooManyRequests(limit: Limit, resetAt: number): NextResponse {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too Many Requests", message: "Rate limit exceeded. Please try again later.", retryAfter },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Limit": limit.max.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(resetAt).toISOString(),
      },
    },
  );
}

export function enforceOriginRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (shouldSkip(pathname)) return null;

  const key = getClientIp(request);
  const limits: Limit[] = [];
  if (pathname.startsWith("/api/")) limits.push({ name: "api", max: 60, windowMs: 60_000 });
  if (!safeMethods.has(request.method)) limits.push({ name: "writes", max: 20, windowMs: 60_000 });
  if (request.method === "GET" || request.method === "HEAD") limits.push({ name: "pages-burst", max: 240, windowMs: 60_000 });
  limits.push({ name: "origin-sustained", max: 900, windowMs: 60_000 });

  for (const limit of limits) {
    const result = hitLimit(key, limit);
    if (result.blocked) return tooManyRequests(limit, result.resetAt);
  }
  return null;
}
