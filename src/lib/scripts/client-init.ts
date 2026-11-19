/* global window, document, Element, Event, HTMLAnchorElement, HTMLElement, MouseEvent */
import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import intersect from '@alpinejs/intersect'
import anchor from '@alpinejs/anchor'
import { $cart, addItem, removeItem } from '@/store/cartStore'
import { $themeStore, type ThemeType } from '@/store/themeStore'
import { Product } from '@/features/products/products.model'
import { setupCartHandler } from '@/lib/scripts/cart'
import heroCarousel from '@/lib/scripts/heroCarousel'

const productTransitionReturnKey = 'product-transition-return'

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
    setupProductTransitionSelection()
    setupCartHandler(Alpine)
    setupCategoryCarousel()
    window.AlpineInstance = Alpine
  }
}

const setupProductTransitionSelection = () => {
  const selectProductCard = (event: Event) => {
    if (!(event.target instanceof Element)) return

    const link = event.target.closest('a[href]')
    if (!(link instanceof HTMLAnchorElement)) return

    const pathSegments = link.pathname.split('/').filter(Boolean)
    if (pathSegments.length !== 3 || pathSegments[0] !== 'product') return

    const selectedCard = link.closest<HTMLElement>('.product-transition-scope')
    if (!selectedCard) return

    document
      .querySelectorAll<HTMLElement>('.product-transition-scope[data-transition-selected]')
      .forEach((card) => card.removeAttribute('data-transition-selected'))
    selectedCard.setAttribute('data-transition-selected', '')

    const productId = selectedCard.dataset.transitionProductId
    if (productId) {
      const source = `${window.location.pathname}${window.location.search}`
      const destination = `${link.pathname}${link.search}`
      window.sessionStorage.setItem(
        productTransitionReturnKey,
        `${productId}|${source}|${destination}`
      )
    }
  }

  document.addEventListener('pointerdown', selectProductCard, true)
  document.addEventListener(
    'click',
    (event) => {
      if (event instanceof MouseEvent && event.detail > 0) return
      selectProductCard(event)
    },
    true
  )
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
const normalizeCatalogText = (value: string) =>
  value
    .toLowerCase()
    .replace(/ñ/g, '\uE000')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\uE000/g, 'ñ')

type CatalogSearchProduct = {
  title: string
  tags: string[]
}

const setupCatalogHandler = () => {
  Alpine.data(
    'catalogHandler',
    (searchableProducts: CatalogSearchProduct[], pathname: string) => {
      const storageKey = `catalog-limit:${pathname}`
      const savedLimit = Number(window.sessionStorage.getItem(storageKey))
      const initialLimit =
        Number.isInteger(savedLimit) && savedLimit > 0
          ? Math.min(savedLimit, searchableProducts.length)
          : 12

      return {
        limit: initialLimit,
        search: '',
        activeQuickFilter: '',
        searchableProducts,
        get totalCount() {
          return this.searchableProducts.filter((product) => this.matchesProduct(product)).length
        },
        matchesSearch(product: CatalogSearchProduct) {
          const searchTerm = normalizeCatalogText(this.search)

          return (
            normalizeCatalogText(product.title).includes(searchTerm) ||
            product.tags.some((tag) => normalizeCatalogText(tag).includes(searchTerm))
          )
        },
        matchesQuickFilter(product: CatalogSearchProduct) {
          if (!this.activeQuickFilter) return true

          const quickFilterTag = normalizeCatalogText(this.activeQuickFilter)
          return product.tags.some((tag) => normalizeCatalogText(tag) === quickFilterTag)
        },
        matchesProduct(product: CatalogSearchProduct) {
          return this.matchesSearch(product) && this.matchesQuickFilter(product)
        },
        shouldShow(index: number) {
          const product = this.searchableProducts[index]
          if (!product || !this.matchesProduct(product)) return false

          const matchesBefore = this.searchableProducts
            .slice(0, index)
            .filter((candidateProduct) => this.matchesProduct(candidateProduct)).length

          return matchesBefore < this.limit
        },
        selectQuickFilter(tag: string) {
          this.activeQuickFilter = this.activeQuickFilter === tag ? '' : tag
          this.resetLimit()
        },
        loadMore() {
          this.limit = Math.min(this.limit + 12, this.totalCount)
          window.sessionStorage.setItem(storageKey, String(this.limit))
        },
        resetLimit() {
          this.limit = 12
          window.sessionStorage.setItem(storageKey, String(this.limit))
        },
        clearSearch() {
          this.search = ''
          this.resetLimit()
        },
        clearFilters() {
          this.search = ''
          this.activeQuickFilter = ''
          this.resetLimit()
        },
      }
    }
  )
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

const setupCategoryCarousel = () => {
  Alpine.data('carousel', heroCarousel)
}
