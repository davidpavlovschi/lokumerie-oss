import { NextResponse, type NextRequest } from "next/server";
import { enforceOriginRateLimit } from "./lib/origin-rate-limit";

export function proxy(request: NextRequest) {
  const originRateLimitResponse = enforceOriginRateLimit(request);
  if (originRateLimitResponse) {
    return originRateLimitResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:avif|bmp|css|gif|ico|jpeg|jpg|js|json|map|mp3|mp4|ogg|otf|pdf|png|svg|txt|webm|webmanifest|webp|woff|woff2|xml)$).*)",
  ],
};
