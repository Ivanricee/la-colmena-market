//ACTUALMENTE NO SE USA QSTASH LLAMA DIRECTAMENTE EL WEBHOOK DE VERCEL
//ESTA API SIRVE PARA VALIDAR LA AUTENTICIDAD DEL HEADER Upstash-Signature SI EN UN FUTURO SE NECESITA VALIDAR LA AUTENTICIDAD DE LA PETICIÓN
import { verifyQstashSignature } from '@/lib/QStash'

export const prerender = false
export const POST = async ({ request }: any) => {
  console.log({ headers: request.headers })

  const signature = request.headers.get('Upstash-Signature') || ''
  const upstashRegion = request.headers.get('Upstash-Region') || undefined
  const body = await request.text()
  const isValid = await verifyQstashSignature({
    body,
    signature,
    upstashRegion,
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
