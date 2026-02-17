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
      return Object.keys(Alpine.store('cartStore')?.data?.total ?? 0)
    },
    setStep(step: number) {
      this.step = step
    },
  }))
}
