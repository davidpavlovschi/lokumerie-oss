export const FLAVORS = {
  pistache: { label: "Pistache", color: "#4a7c59", hint: "Code quality & refactoring" },
  rose: { label: "Rose", color: "#c2185b", hint: "Design & UI/UX" },
  citron: { label: "Citron", color: "#e6b422", hint: "Performance & SEO" },
  grenade: { label: "Grenade", color: "#9b2335", hint: "Security & testing" },
  safran: { label: "Safran", color: "#d4a017", hint: "APIs & integrations" },
  menthe: { label: "Menthe", color: "#3eb489", hint: "DevOps & deployment" },
  cafe: { label: "Café", color: "#6f4e37", hint: "Databases & ORMs" },
  miel: { label: "Miel", color: "#d4a373", hint: "Workflow & tooling" },
  orange: { label: "Orange", color: "#cc5500", hint: "Mobile development" },
  cannelle: { label: "Cannelle", color: "#8b4513", hint: "Content & writing" },
} as const;

export type FlavorKey = keyof typeof FLAVORS;

export const flavorKeys = Object.keys(FLAVORS) as FlavorKey[];

export function isValidFlavor(key: string): key is FlavorKey {
  return key in FLAVORS;
}

interface FlavorRule {
  primary: string[];
  secondary: string[];
}

const FLAVOR_RULES: Record<FlavorKey, FlavorRule> = {
  pistache: {
    primary: ["refactor", "code review", "linter", "eslint", "prettier", "clean code", "algorithm"],
    secondary: ["implement", "function", "class", "module", "compile", "syntax"],
  },
  rose: {
    primary: ["figma", "tailwind", "responsive design", "glassmorphism", "color palette", "typography", "shadcn"],
    secondary: ["ui", "ux", "css", "style", "visual", "component", "animation", "theme"],
  },
  citron: {
    primary: ["lighthouse", "core web vitals", "seo", "page speed", "bundle size", "analytics", "sitemap"],
    secondary: ["optimize", "performance", "cache", "minify", "indexing", "opengraph"],
  },
  grenade: {
    primary: ["xss", "csrf", "unit test", "e2e test", "jest", "vitest", "playwright", "cypress", "debugger"],
    secondary: ["security", "auth", "validation", "test", "debug", "mock", "sanitize", "rls"],
  },
  safran: {
    primary: ["rest api", "graphql", "webhook", "openapi", "swagger", "stripe", "rate limit", "api key"],
    secondary: ["api", "integration", "fetch", "endpoint", "middleware", "cors", "sdk"],
  },
  menthe: {
    primary: ["dockerfile", "kubernetes", "github actions", "ci/cd", "vercel", "terraform", "nginx", "fastlane"],
    secondary: ["deploy", "docker", "devops", "infrastructure", "pipeline", "hosting"],
  },
  cafe: {
    primary: ["prisma", "drizzle", "postgresql", "supabase", "foreign key", "index", "join", "sql query"],
    secondary: ["database", "sql", "schema", "migration", "model", "relation", "table", "orm"],
  },
  miel: {
    primary: ["git workflow", "commit convention", "pre-commit", "makefile", "shell script", "monorepo"],
    secondary: ["workflow", "automation", "script", "tool", "productivity", "cli", "scaffold"],
  },
  orange: {
    primary: ["swiftui", "uikit", "xcode", "flutter", "react native", "expo", "app store", "testflight", "cocoapods"],
    secondary: ["mobile", "ios", "android", "swift", "kotlin", "touch", "navigation"],
  },
  cannelle: {
    primary: ["copywriting", "blog post", "readme", "changelog", "content strategy", "newsletter", "aso", "localization"],
    secondary: ["content", "writing", "copy", "marketing", "documentation", "prose"],
  },
};

const PRIMARY_WEIGHT = 3;
const SECONDARY_WEIGHT = 1;

function matchKeyword(lower: string, keyword: string): boolean {
  if (keyword.includes(" ")) return lower.includes(keyword);
  return new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(lower);
}

export function detectFlavor(content: string): FlavorKey {
  const lower = content.toLowerCase();
  let bestFlavor: FlavorKey = "miel";
  let bestScore = 0;

  for (const [key, rule] of Object.entries(FLAVOR_RULES) as [FlavorKey, FlavorRule][]) {
    let score = 0;
    for (const kw of rule.primary) {
      if (matchKeyword(lower, kw)) score += PRIMARY_WEIGHT;
    }
    for (const kw of rule.secondary) {
      if (matchKeyword(lower, kw)) score += SECONDARY_WEIGHT;
    }
    if (score > bestScore) {
      bestScore = score;
      bestFlavor = key;
    }
  }

  return bestFlavor;
}
