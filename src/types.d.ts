import type { Cart } from '@/store/cartStore'

declare global {
  interface Window {
    AlpineInstance?: any
  }
}

declare module 'alpinejs' {
  interface Alpine {
    store(name: 'cartStore', value: CartStoreType): void
    store(name: string): any
  }
}

interface CartStoreType {
  data: Cart
  init(): void
}

declare module '@alpinejs/collapse' {
  function collapse(): void
  export default collapse
}
