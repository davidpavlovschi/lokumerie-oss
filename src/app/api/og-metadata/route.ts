import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "bot" },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();

    const get = (property: string): string | null => {
      // Try og: and twitter: variants
      for (const prefix of ["og", "twitter"]) {
        const re = new RegExp(
          `<meta[^>]*(?:property|name)=["']${prefix}:${property}["'][^>]*content=["']([^"']*)["']`,
          "i"
        );
        const match = html.match(re);
        if (match?.[1]) return match[1];
        // Also handle content before property
        const re2 = new RegExp(
          `<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${prefix}:${property}["']`,
          "i"
        );
        const match2 = html.match(re2);
        if (match2?.[1]) return match2[1];
      }
      return null;
    };

    // Fallback title from <title> tag
    const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? null;

    // Fallback description from meta description
    const descTag =
      html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i
      )?.[1] ??
      html.match(
        /<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i
      )?.[1] ??
      null;

    return NextResponse.json({
      title: get("title") || titleTag || null,
      description: get("description") || descTag || null,
      image: get("image") || null,
      siteName: get("site_name") || null,
    });
  } catch {
    return NextResponse.json(
      { title: null, description: null, image: null, siteName: null }
    );
  }
}
