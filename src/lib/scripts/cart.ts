import { handleNextStep, proceedFromStep } from '../utils/cart.order'

type AlpineLike = {
  data: (name: string, callback: () => any) => void
  store: (name: string) => any
}

export const setupCartHandler = (Alpine: AlpineLike) => {
  Alpine.data('cartHandler', () => ({
    step: 1,
    get items() {
      return Alpine.store('cartStore')?.data?.items ?? {}
    },
    get itemCount() {
      return Object.keys(Alpine.store('cartStore')?.data?.items ?? {}).length
    },
    get totalPrice() {
      return (Alpine.store('cartStore')?.data?.total ?? 0).toFixed(2)
    },
    canProceedFromStep() {
      return proceedFromStep({ step: this.step, items: this.items })
    },
    nextStep() {
      console.log('nextStep aaaa')
      const nextStep = handleNextStep({ step: this.step })
      this.setStep(nextStep)
    },
    setStep(step: number) {
      this.step = step
    },
  }))
}
