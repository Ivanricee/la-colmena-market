import type { APIRoute } from 'astro'
import { redisClient } from '@/lib/redis'

export const prerender = false

export const GET: APIRoute = async () => {
  const startTime = Date.now()
  const result = {
    redis: { status: 'unknown', latency: 0, error: null as string | null },
  }

  try {
    const redisStart = Date.now()
    await redisClient.ping()
    result.redis.latency = Date.now() - redisStart
    result.redis.status = 'ok'
  } catch (error) {
    result.redis.status = 'error'
    result.redis.error = error instanceof Error ? error.message : 'Unknown error'
  }

  const totalTime = Date.now() - startTime

  return new Response(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      totalTime: `${totalTime}ms`,
      service: result.redis,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
