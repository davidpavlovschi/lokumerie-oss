export function validateEnv() {
  const required = ["DATABASE_URL", "AUTH_SECRET"];
  const missing = required.filter(key => !process.env[key])
  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(', ')}`)
  }

  const hasGitHub = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);
  const hasGoogle = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  if (!hasGitHub && !hasGoogle) {
    console.error("Configure at least one OAuth provider: GitHub or Google.");
  }
}
