import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro/zod'
import { DELIVERY_ADDRESSES } from '@/pages/cart/cart.config'
import { turso } from '@/lib/db/turso'
import { WHATSAPP_TO_NUMBER, PUBLIC_SITE_URL } from 'astro:env/server'

const cartItemSchema = z.object({
  title: z.string(),
  price: z.number(),
  quantity: z.number(),
  purchaseLimit: z.number(),
  imgUrl: z.string(),
  categoryId: z.object({
    slug: z.string(),
    id: z.string(),
    name: z.string(),
  }),
})

export const server = {
  finalizeTicket: defineAction({
    input: z.object({
      name: z
        .string()
        .trim()
        .min(3, 'Ingresa tu nombre completo')
        .max(100, 'El nombre es demasiado largo'),
      phone: z
        .string()
        .trim()
        .min(10, 'Ingresa un número válido de 10 dígitos')
        .max(15, 'Número demasiado largo')
        .regex(/^[0-9+\s()-]+$/, 'Solo números y caracteres válidos'),
      addressId: z.string().min(1, 'Selecciona un punto de entrega'),
      note: z.string().max(300, 'Máximo 300 caracteres').optional(),
      items: z.record(z.string(), cartItemSchema),
      totalPrice: z.number().positive('El total debe ser mayor a cero'),
    }),
    handler: async ({ name, phone, addressId, note, items, totalPrice }) => {
      const address = DELIVERY_ADDRESSES.find((a) => a.id === addressId)
      if (!address) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'La dirección de entrega seleccionada no es válida.',
        })
      }

      const itemEntries = Object.entries(items)
      if (itemEntries.length === 0) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'El carrito está vacío.',
        })
      }

      const ticketId = crypto.randomUUID()
      const createdAt = new Date().toISOString()
      const ticketUrl = `${PUBLIC_SITE_URL}/pedidos/${ticketId}`

      const itemLines = itemEntries
        .slice(0, 15)
        .map(
          ([, item]) =>
            `• ${item.quantity}x ${item.title} — $${(item.price * item.quantity).toFixed(2)}`
        )
        .join('\n')

      const message =
        `🍯 *Nuevo Pedido - La Colmena Market*\n\n` +
        `👤 *Cliente:* ${name}\n` +
        `📱 *Tel:* ${phone}\n` +
        `📍 *Entrega:* ${address.full}\n` +
        `${note ? `📝 *Notas:* ${note}\n` : ''}` +
        `\n📦 *Productos:*\n${itemLines}\n\n` +
        `💰 *Total:* $${totalPrice.toFixed(2)}\n\n` +
        `🔗 *Ver ticket:* ${ticketUrl}`

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_TO_NUMBER}&text=${encodeURIComponent(message)}`

      try {
        await turso.execute({
          sql: `INSERT INTO tickets (
            id, created_at,
            customer_name, customer_phone, customer_note,
            address_id, address_label, address_full,
            items_json, total_price,
            message, whatsapp_url, ticket_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            ticketId,
            createdAt,
            name,
            phone,
            note ?? '',
            address.id,
            address.label,
            address.full,
            JSON.stringify(items),
            totalPrice,
            message,
            whatsappUrl,
            ticketUrl,
          ],
        })
      } catch (err) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se pudo guardar el pedido. Intenta de nuevo.',
        })
      }

      return { ticketId, whatsappUrl }
    },
  }),
}
