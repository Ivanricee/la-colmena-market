import { DELIVERY_ADDRESSES } from '@/pages/cart/cart.config'
import { step2Schema, step3Schema } from '@/schemas/checkout'
import { Cart, CartItem, clearCart } from '@/store/cartStore'
import { actions, isInputError } from 'astro:actions'
import { navigate } from 'astro:transitions/client'

type StepType = {
  items?: Cart
  step: number
  customer?: { name: string; phone: string; note?: string }
  delivery?: { addressId: string }
}

export const canProceedFromStep = ({ items, step, customer, delivery }: StepType): boolean => {
  if (step === 1 && items) return Object.values(items).length > 0
  if (step === 2 && customer) return step2Schema.safeParse(customer).success
  if (step === 3 && delivery) return step3Schema.safeParse(delivery).success
  return true
}

type NextStepResult =
  | { ok: true; nextStep: number }
  | { ok: false; errors: Record<string, string[]> }

type NextStepType = {
  step: number
  customer?: { name: string; phone: string; note?: string }
  delivery?: { addressId: string }
}

export const handleNextStep = ({ step, customer, delivery }: NextStepType): NextStepResult => {
  if (step === 2 && customer) {
    const result = step2Schema.safeParse(customer)
    if (!result.success) {
      return { ok: false, errors: result.error.flatten().fieldErrors as Record<string, string[]> }
    }
  }
  if (step === 3 && delivery) {
    const result = step3Schema.safeParse(delivery)
    if (!result.success) {
      return { ok: false, errors: result.error.flatten().fieldErrors as Record<string, string[]> }
    }
  }
  return { ok: true, nextStep: Math.min(step + 1, 4) }
}

type FinalizeType = {
  name: string
  phone: string
  addressId: string
  note?: string
  items: Record<string, CartItem>
  totalPrice: number
}

export type FinalizeError = {
  type: 'validation' | 'server'
  message: string
  fieldErrors?: Record<string, string[]>
}

export const handleFinalize = async ({
  name,
  phone,
  addressId,
  note,
  items,
  totalPrice,
}: FinalizeType): Promise<{ ok: false; error: FinalizeError } | { ok: true }> => {
  const { data, error } = await actions.finalizeTicket({
    name,
    phone,
    addressId,
    note,
    items,
    totalPrice,
  })

  if (error) {
    if (isInputError(error)) {
      return {
        ok: false,
        error: {
          type: 'validation',
          message: 'Revisa los datos del formulario.',
          fieldErrors: error.fields as Record<string, string[]>,
        },
      }
    }
    return {
      ok: false,
      error: {
        type: 'server',
        message: error.message ?? 'Ocurrió un error al procesar tu pedido.',
      },
    }
  }

  clearCart()
  navigate(`/pedidos/${data.ticketId}?openWa=1`)
  return { ok: true }
}
