import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import intersect from '@alpinejs/intersect'
import anchor from '@alpinejs/anchor'
import { $cart, addItem, removeItem } from '@/store/cartStore'
import { $themeStore, type ThemeType } from '@/store/themeStore'
import { Product } from '@/features/products/products.model'
import { setupCartHandler } from '@/lib/scripts/cart'

export default function initClientUI(): void {
  if (!window.AlpineInstance) {
    Alpine.plugin(collapse)
    Alpine.plugin(intersect)
    Alpine.plugin(anchor)
    setupAlpineCartStore()
    setupAlpineThemeStore()
    setupAlpineCartUIStore()
    setupCatalogHandler()
    setupInputNumberHandler()
    setupCartHandler(Alpine)
    window.AlpineInstance = Alpine
  }
}

// Theme Store
interface ThemeStore {
  theme: ThemeType
  get(): ThemeType
  set(newValue: ThemeType): void
  toggle(): void
  init(): void
}

const setupAlpineThemeStore = () => {
  if (!Alpine.store('themeStore')) {
    const initialTheme = $themeStore.get()
    Alpine.store('themeStore', {
      theme: initialTheme,
      get() {
        return this.theme
      },
      set(newValue: ThemeType) {
        this.theme = newValue
        $themeStore.set(newValue)
      },
      toggle() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light'
        this.set(newTheme)
      },
      init() {
        // Aplicar tema inicial inmediatamente
        if (initialTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }

        // Suscribirse a cambios futuros
        $themeStore.subscribe((value) => {
          this.theme = value
          if (value === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        })
      },
    } as ThemeStore)
  }
}

// Cart Store
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
        categoryId: categoryid ?? { slug: '', id: '', name: '' },
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
type CartUIStore = {
  open: boolean
  toggle(): void
}
const setupAlpineCartUIStore = () => {
  if (!Alpine.store('cartUI')) {
    Alpine.store('cartUI', {
      open: false,
      toggle() {
        this.open = !this.open
      },
    } as CartUIStore)
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
  Alpine.data('inputNumberHandler', (id: string, purchaseLimit: number, scope = '') => ({
    get uid() {
      return scope ? `${scope}-${id}` : id
    },
    get containerId() {
      return `container-${this.uid}`
    },
    get quantityId() {
      return `quantity-${this.uid}`
    },
    get decBtnId() {
      return `dec-${this.uid}`
    },
    get incBtnId() {
      return `inc-${this.uid}`
    },
    decrease(quantity: number) {
      if (quantity > 1) {
        return Alpine.store('cartStore').handleAddToCart({ id: id, quantity: -1 })
      }
      this.$dispatch('clean-quantity')
      Alpine.store('cartStore').handleRemoveFromCart(id)
    },
    increase(quantity: number) {
      if (quantity < purchaseLimit) {
        Alpine.store('cartStore').handleAddToCart({ id: id, quantity: 1 })
      }
    },
    handleMouseEnter(product: RawProduct) {
      this.isHovered = true
      this.state.show = this.isHovered && product.quantity >= product.purchaseLimit
    },
    handleMouseLeave() {
      this.isHovered = false
      this.state.show = false
    },
    showTooltip(product: RawProduct) {
      if (product.quantity >= product.purchaseLimit && this.isHovered) {
        this.state.show = true
        return
      }
      this.state.show = false
    },
    isHovered: false,
    state: { show: false },
    anchorRef: null,
  }))
}
