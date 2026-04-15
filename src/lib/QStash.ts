import { Client, Receiver } from '@upstash/qstash'
import {
  QSTASH_TOKEN,
  QSTASH_DELAY,
  QSTASH_BUILD_URL,
  QSTASH_URL,
  VERCEL_DEPLOY_HOOK_URL,
} from 'astro:env/server'
export const qstashClient = new Client({
  token: QSTASH_TOKEN,
  baseUrl: QSTASH_URL,
})

type QueuedBuild = {
  body: any
}

export async function scheduleRebuild({ body }: QueuedBuild): Promise<string> {
  const scheduledJob = await qstashClient.publishJSON({
    url: VERCEL_DEPLOY_HOOK_URL, //QSTASH_BUILD_URL
    delay: Number(QSTASH_DELAY),
    body,
  })
  return scheduledJob.messageId
}

type verifyQstashSign = {
  body: any
  signature: string
  upstashRegion?: string
}
export async function verifyQstashSignature({
  body,
  signature,
  upstashRegion,
}: verifyQstashSign): Promise<boolean> {
  const receiver = new Receiver()
  const isValid = await receiver.verify({
    body,
    signature,
    url: QSTASH_BUILD_URL,
    upstashRegion,
  })
  console.log({ body, signature, url: QSTASH_BUILD_URL, upstashRegion, isValid })

  return isValid
}
