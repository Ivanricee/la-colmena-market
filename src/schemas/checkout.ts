import { z } from 'astro/zod'

export const checkoutSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Ingresa tu nombre completo')
    .max(100, 'El nombre es demasiado largo'),
  phone: z
    .string()
    .trim()
    .min(10, 'Ingresa un número válido de 10 dígitos')
    .max(15, 'Número demasiado largo')
    .regex(/^[0-9+\s()-]+$/, 'Solo números y caracteres válidos'),
  addressId: z.string().min(1, 'Selecciona un punto de entrega'),
  note: z.string().max(300, 'Máximo 500 caracteres').optional(),
})
