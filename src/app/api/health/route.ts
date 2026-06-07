export const dynamic = 'force-dynamic'

export function GET() {
  const envCheck = {
    database: !!process.env.DATABASE_URL,
    authSecret: !!process.env.AUTH_SECRET,
  }

  const allOk = Object.values(envCheck).every(Boolean)

  return Response.json({
    status: allOk ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    env: envCheck,
    timestamp: new Date().toISOString(),
  }, { status: allOk ? 200 : 503 })
}
