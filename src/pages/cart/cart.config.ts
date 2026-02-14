type addressesType = {
  id: string
  label: string
  full: string
}
export const DELIVERY_ADDRESSES: addressesType[] = [
  {
    id: 'addr-1',
    label: 'Centro Histórico',
    full: 'Centro Histórico, Calle Principal #123, Col. Centro',
  },
  {
    id: 'addr-2',
    label: 'Zona Norte',
    full: 'Av. Universidad #456, Fracc. Las Palmas, Zona Norte',
  },
  {
    id: 'addr-3',
    label: 'Zona Sur',
    full: 'Blvd. de la Luz #789, Col. Jardines del Sur',
  },
  {
    id: 'addr-4',
    label: 'Plaza del Valle',
    full: 'Plaza del Valle, Local 12, Av. Reforma #1010',
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
