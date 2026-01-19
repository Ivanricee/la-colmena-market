import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import { $cart, addItem, removeItem } from '@/store/cartStore'
import { Image, Product } from '@/features/products/products.model'

export default function initClientUI(): void {
  if (!window.AlpineInstance) {
    Alpine.plugin(collapse)
    setupAlpineCartStore()
    window.AlpineInstance = Alpine
  }
}
//cartStore
interface RawProduct extends Product {
  quantity: number
}
const addToCartStore = (product?: RawProduct) => {
  const { id, title, price, image, quantity } = product ?? {}
  const { version, public_id } = image?.[0] ?? {}

  //ad new product

  if (title || price || image) {
    addItem({
      id: id ?? '',
      item: {
        title: title ?? '',
        price: Number(price ?? 0),
        imgUrl: `https://res.cloudinary.com/ivanrice-c/image/upload/ar_3:4,c_pad,dpr_1.0,g_center,q_auto,b_auto,f_auto,w_100/v${version}/${public_id}.webp`,
        quantity: quantity ?? 1,
      },
      quantity,
    })
    return
  }
  //increment | decrement
  addItem({ id: id ?? '', quantity: quantity ?? 1 })
}

const setupAlpineCartStore = () => {
  if (!Alpine.store('cartStore')) {
    Alpine.store('cartStore', {
      data: $cart.get(),
      handleAddToCart(product?: RawProduct) {
        addToCartStore(product)
      },
      handleRemoveFromCart(id: string) {
        removeItem(id)
      },
      init() {
        $cart.subscribe((newProducto) => {
          this.data = { ...newProducto }
        })
      },
    })
  }
}
