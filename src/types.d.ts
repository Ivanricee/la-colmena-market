import type { Cart } from '@/store/cartStore'

declare global {
  interface Window {
    AlpineInstance?: any
  }
}

declare module 'alpinejs' {
  interface Alpine {
    store(name: 'cartStore', value: CartStoreType): void
    store(name: 'cartStore'): CartStoreType
    store(name: string): any
  }
}

interface CartStoreType {
  data: Cart
  handleAddToCart(product?: any): void
  init(): void
}
