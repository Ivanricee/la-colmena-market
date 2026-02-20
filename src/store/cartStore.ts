//import { map } from 'nanostores'
import { Category } from '@/features/products/products.model'
import { persistentMap } from '@nanostores/persistent'
//types
export type CartItem = {
  title: string
  price: number
  quantity: number
  purchaseLimit: number
  imgUrl: string
  categoryId: Category
}
export interface Cart {
  items: Record<string, CartItem>
  total: number
}
// state
export const $cart = persistentMap<Cart>(
  'cart:',
  { items: {}, total: 0 },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)
// actions
type AddItemType = {
  id: string
  item?: CartItem
  quantity?: number
  categoryId?: Category
}
export function addItem({ id, item, quantity }: AddItemType) {
  const cart = $cart.get()
  const itemInCart = cart.items[id]
  const quantityToAdd = quantity ?? 1

  const currentPurchaseLimit = item?.purchaseLimit ?? itemInCart?.purchaseLimit
  const currentQty = itemInCart?.quantity ?? 0
  const proposedQty = currentQty + quantityToAdd
  const clampedQty =
    typeof currentPurchaseLimit === 'number'
      ? Math.min(proposedQty, currentPurchaseLimit)
      : proposedQty

  if (
    typeof currentPurchaseLimit === 'number' &&
    currentQty >= currentPurchaseLimit &&
    quantityToAdd > 0
  ) {
    return
  }

  const updatedItems = {
    ...cart.items,
    [id]: !itemInCart && item ? { ...item } : { ...itemInCart, quantity: clampedQty },
  }
  const total = Object.values(updatedItems).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  $cart.set({
    items: updatedItems,
    total,
  })
}
export function removeItem(id: string) {
  const cart = $cart.get()
  const updatedItems = { ...cart.items }
  const deletedItem = updatedItems[id]
  if (!deletedItem) return
  delete updatedItems[id]
  $cart.set({
    items: updatedItems,
    total: cart.total - deletedItem.price * deletedItem.quantity,
  })
}
export function clearCart() {
  $cart.set({ items: {}, total: 0 })
}
