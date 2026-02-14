import { DELIVERY_ADDRESSES } from '@/pages/cart/cart.config'
import { checkoutSchema } from '@/schemas/checkout'
import { Cart } from '@/store/cartStore'
import { randomUUID } from 'crypto'

export const generateOrderKey = () => {
  const uuid = randomUUID()
  return `MA-${uuid.split('-')[0].toUpperCase()}`
}

type StepType = {
  items?: Cart
  step: number
  userData?: HTMLFormElement
}
export const canProceedFromStep = ({ items, step, userData }: StepType) => {
  if (step === 1 && items) return Object.values(items).length > 0
  if (step === 2 && userData) {
    const formData = new FormData(userData)
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const phoneTest = /^[0-9+\s()-]{10,15}$/.test(phone.trim())
    return name.trim().length >= 2 && phoneTest
  }
  if (step === 3 && userData) {
    const formData = new FormData(userData)
    const address = formData.get('address') as string
    return !!address
  }
  return true
}

type NextStepType = {
  step: number
  userData?: HTMLFormElement
}
export const nextStep = async ({ step, userData }: NextStepType) => {
  const formData = new FormData(userData)
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  if (step === 2) {
    const data = { name, phone }
    const result = checkoutSchema.safeParse(data)
    if (!result.success) {
      //trigger alpine error
      return result.error.flatten().fieldErrors
    }
  }
  if (step === 3) {
    const data = { address }
    const result = checkoutSchema.safeParse(data)
    if (!result.success) {
      //trigger alpine error
      return result.error.flatten().fieldErrors
    }
  }
  const next = Math.min(step + 1, 4)
  //emit next step  setStep()
}
export const prevStep = (step: number) => {
  //emit prev step  setStep()
  //setStep((s) => Math.max(s - 1, 1))
}

type FinalizeType = {
  formData: HTMLFormElement
  items: Cart
  totalPrice: number
}
export const handleFinalize = ({ formData, items, totalPrice }: FinalizeType) => {
  const values = formData.getValues()
  const orderKey = generateOrderKey()
  const address = DELIVERY_ADDRESSES.find((a) => a.id === values.addressId)

  const orderData = {
    key: orderKey,
    date: new Date().toISOString(),
    customer: {
      name: values.name.trim(),
      phone: values.phone.trim(),
      notes: values.notes?.trim() || '',
    },
    delivery: {
      addressId: values.addressId,
      addressLabel: address?.label || '',
      addressFull: address?.full || '',
    },
    items: structuredClone(items.items),
    totalItems: items.total,
    totalPrice: Number(totalPrice.toFixed(2)),
  }
  // Save to localStorage for review
  const orders = JSON.parse(localStorage.getItem('orders') || '{}')
  orders[orderKey] = orderData
  localStorage.setItem('orders', JSON.stringify(orders))

  // Build WhatsApp message
  /*const itemLines = items
    .map(
      (i) => `• ${i.quantity}x ${i.product.name} — $${(i.product.price * i.quantity).toFixed(2)}`
    )
    .join('\n')
*/
  /*const message =
    `🍯 *Nuevo Pedido — ${orderKey}*\n\n` +
    `👤 *Cliente:* ${values.name.trim()}\n` +
    `📱 *Tel:* ${values.phone.trim()}\n` +
    `📍 *Entrega:* ${address?.full || ''}\n` +
    `${values.notes ? `📝 *Notas:* ${values.notes.trim()}\n` : ''}` +
    `\n📦 *Productos:*\n${itemLines}\n\n` +
    `💰 *Total:* $${totalPrice.toFixed(2)}\n` +
    `🔑 *Clave:* ${orderKey}`

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  */
  /* clearCart()
  window.open(waUrl, '_blank')
*/
  /* toast({
    title: '¡Pedido enviado!',
    description: `Tu clave de pedido es ${orderKey}`,
  })
*/
  // navigate(`/pedido/${orderKey}`)
}
