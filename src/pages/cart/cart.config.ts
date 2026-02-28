type addressesType = {
  id: string
  label: string
  full: string
}
export const DELIVERY_ADDRESSES: addressesType[] = [
  {
    id: 'addr-1',
    label: 'Entrega habitual',
    full: 'Poniente 6',
  },
  {
    id: 'addr-2',
    label: 'Casas Ara',
    full: 'Frente a Tienda 3B, Cerro del Quetzal',
  },
  {
    id: 'addr-3',
    label: 'Paradero Tláhuac',
    full: 'Frente a Farmacias del Ahorro, Av. Tláhuac',
  },
  {
    id: 'addr-4',
    label: 'Cuauhtémoc y Cuitláhuac',
    full: 'Esquina entre Av. Cuauhtémoc y Av. Cuitláhuac, frente a los bicitaxis',
  },
]
export const STEPS = [
  { id: 1, label: 'Tu Pedido', icon: 'package' },
  { id: 2, label: 'Tus Datos', icon: 'user' },
  { id: 3, label: 'Entrega', icon: 'map-pin' },
  { id: 4, label: 'Confirmar', icon: 'check' },
]
/**Controlar la seleccion automatica de la direccion basado en su id */
//selectedAddress
