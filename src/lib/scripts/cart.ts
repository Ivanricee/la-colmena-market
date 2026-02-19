import { canProceedFromStep, handleFinalize, handleNextStep } from '../utils/cart.order'
import { step2Schema, step3Schema } from '../../schemas/checkout'
import type { FinalizeError } from '../utils/cart.order'

type AlpineLike = {
  data: (name: string, callback: () => any) => void
  store: (name: string) => any
}

export const setupCartHandler = (Alpine: AlpineLike) => {
  Alpine.data('cartHandler', () => ({
    step: 1,
    customer: { name: '', phone: '', note: '' },
    delivery: { addressId: '' },
    errors: {} as Record<string, string[]>,
    finalizeError: null as FinalizeError | null,
    isSubmitting: false,

    get items() {
      return Alpine.store('cartStore')?.data?.items ?? {}
    },
    get itemCount() {
      return Object.keys(Alpine.store('cartStore')?.data?.items ?? {}).length
    },
    get totalPrice(): number {
      return Alpine.store('cartStore')?.data?.total ?? 0
    },

    get canProceed(): boolean {
      return canProceedFromStep({
        step: this.step,
        items: this.items,
        customer: this.customer,
        delivery: this.delivery,
      })
    },
    async finalize() {
      this.finalizeError = null
      this.isSubmitting = true
      const result = await handleFinalize({
        name: this.customer.name,
        phone: this.customer.phone,
        addressId: this.delivery.addressId,
        note: this.customer.note || undefined,
        items: this.items,
        totalPrice: this.totalPrice,
      })
      this.isSubmitting = false
      if (!result.ok) {
        this.finalizeError = result.error
        if (result.error.fieldErrors) {
          this.errors = result.error.fieldErrors
        }
      }
    },
    clearError(field: string) {
      if (!this.errors[field]) return
      const { [field]: _removed, ...rest } = this.errors
      this.errors = rest
    },

    validateField(field: string) {
      const schema = this.step === 2 ? step2Schema : step3Schema
      const data = this.step === 2 ? this.customer : this.delivery
      const result = schema.safeParse(data)
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>
        if (fieldErrors[field]) {
          this.errors = { ...this.errors, [field]: fieldErrors[field] }
        } else {
          this.clearError(field)
        }
      } else {
        this.clearError(field)
      }
    },

    nextStep() {
      this.errors = {}
      const result = handleNextStep({
        step: this.step,
        customer: this.customer,
        delivery: this.delivery,
      })
      if (!result.ok) {
        this.errors = result.errors
        return
      }
      this.step = result.nextStep
    },

    prevStep() {
      this.errors = {}
      this.step = Math.max(this.step - 1, 1)
    },

    setStep(step: number) {
      this.step = step
    },
  }))
}
