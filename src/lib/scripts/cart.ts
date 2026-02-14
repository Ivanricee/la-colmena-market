import Alpine from 'alpinejs'
//si no funiona inicializar en init.
//const setupInputNumberHandler = () => {
Alpine.data('cartHandler', () => ({
  itemCount: Object.keys(Alpine.store('cartStore').data.items).length,
  step: 1,
  setStep(step: number) {
    this.step = step
  },
}))
//}
