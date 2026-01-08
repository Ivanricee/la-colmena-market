import { map } from "nanostores";

//types
type CartItem<> = {    
    title: string;
    price: number;
    quantity: number;
}
interface Cart {
    items: Record<string,CartItem>
    total: number;
}
// state
export const $cart = map<Cart>({items: {}, total: 0});

// actions
export function addItem(id:string, item?: CartItem){
    const cart = $cart.get()
    const itemInCart = cart.items[id]
    const updatedItems = {
        ...cart.items,
        [id]: !itemInCart && item
            ? {...item}
            : {...itemInCart, quantity: itemInCart.quantity + 1}
    }
    const total = Object.values(updatedItems)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

    $cart.set({
        items: updatedItems,
        total
    });
}
export function removeItem(id: string){
    const cart = $cart.get()
    const updatedItems = {...cart.items}
    delete updatedItems[id]
    const total = Object.values(cart.total).reduce((sum, item) => sum + (item.price * item.quantity), 0)
    $cart.set({
        items: updatedItems,
        total
    })
}
