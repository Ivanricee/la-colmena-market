import { verifyQstashSignature } from '@/lib/QStash'

export const prerender = false
export const POST = async ({ request }: any) => {
  console.log({ headers: request.headers })

  const signature = request.headers.get('Upstash-Signature') || ''
  //const body = await request.body;
  const body = await request.text()
  const isValid = await verifyQstashSignature({
    body,
    signature,
  })
  try {
    if (!isValid) {
      console.error('Firma inválida - no viene de QStash')
      return new Response(
        JSON.stringify({
          message: 'Invalid qstashsignature',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('Error verificando firma:', error)
    return new Response('Unauthorized', { status: 401 })
  }
  console.log('Running build')
  return new Response(
    JSON.stringify({
      message: 'Running build',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
