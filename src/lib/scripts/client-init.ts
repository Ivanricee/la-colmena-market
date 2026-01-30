import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import intersect from '@alpinejs/intersect'
import anchor from '@alpinejs/anchor'
import { $cart, addItem, removeItem } from '@/store/cartStore'
import { Product } from '@/features/products/products.model'

export default function initClientUI(): void {
  if (!window.AlpineInstance) {
    Alpine.plugin(collapse)
    Alpine.plugin(intersect)
    Alpine.plugin(anchor)
    setupAlpineCartStore()
    setupCatalogHandler()
    setupInputNumberHandler()
    window.AlpineInstance = Alpine
  }
}
//cartStore
interface RawProduct extends Product {
  quantity: number
}
const addToCartStore = (product?: RawProduct) => {
  const { id, title, price, image, quantity, categoryid, purchaseLimit } = product ?? {}
  const { version, public_id } = image?.[0] ?? {}

  //add new product

  if (title || price || image) {
    addItem({
      id: id ?? '',
      item: {
        title: title ?? '',
        price: Number(price ?? 0),
        imgUrl: `https://res.cloudinary.com/ivanrice-c/image/upload/ar_3:4,c_pad,dpr_1.0,g_center,q_auto,b_auto,f_auto,w_100/v${version}/${public_id}.webp`,
        quantity: quantity ?? 1,
        purchaseLimit: purchaseLimit ?? 10,
        categoryId: categoryid ?? { slug: '', id: '' },
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

const setupCatalogHandler = () => {
  Alpine.data('catalogHandler', (totalCount: number) => ({
    limit: 12,
    search: '',
    totalCount,
    shouldShow(index: number, title: string) {
      const matchesSearch = title.toLowerCase().includes(this.search.toLowerCase())
      const isWithinLimit = index < this.limit
      return matchesSearch && isWithinLimit
    },
    loadMore() {
      this.limit += 12
    },
  }))
}
const setupInputNumberHandler = () => {
  Alpine.data('inputNumberHandler', (id: string, purchaseLimit: number) => ({
    get quantityId() {
      return `quantity-${id}`
    },
    get decBtnId() {
      return `dec-${id}`
    },
    get incBtnId() {
      return `inc-${id}`
    },
    decrease(quantity: number) {
      if (this.state.disableIncreament && quantity <= purchaseLimit) {
        this.$dispatch('clean-quantity')
        this.state.disableIncreament = false
        this.state.show = false
      }
      if (quantity > 1) {
        return Alpine.store('cartStore').handleAddToCart({ id: id, quantity: -1 })
      }
      this.$dispatch('clean-quantity')
      Alpine.store('cartStore').handleRemoveFromCart(id)
    },
    increase(quantity: number) {
      if (quantity >= purchaseLimit) {
        this.state.disableIncreament = true
        this.state.show = true
        return
      }

      Alpine.store('cartStore').handleAddToCart({ id: id, quantity: 1 })
    },
    state: { show: false, disableIncreament: false },
    anchorRef: null,
  }))
}
