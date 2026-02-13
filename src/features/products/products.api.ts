import { gql } from 'graphql-request'
import type { Product } from './products.model'
import { hygraphClient } from '@/lib/hygraph'
type productResponse = {
  productos: Product[] | []
  errorMessage?: string
}
interface GetProductsParams {
  first?: number
  skip?: number
  where?: Record<string, any>
}
export const getProducts = async (params?: GetProductsParams): Promise<productResponse> => {
  const { first = 100, skip = 0, where = {} } = params || {}

  try {
    const { productos } = await hygraphClient.request(
      gql`
        query GetProducts($first: Int!, $skip: Int!, $where: Productos_idWhereInput) {
          productos(first: $first, skip: $skip, where: $where) {
            id
            title
            description {
              html
            }
            image
            price
            previousPrice
            stock
            purchaseLimit
            specifications {
              html
            }
            benefits
            brand
            productStatus
            weight
            tags
            featured
            categoryid {
              name
              slug
              id
            }
            contenidoNeto
            unidad
          }
        }
      `,
      {
        first,
        skip,
        where: Object.keys(where).length > 0 ? where : null,
      }
    )

    return { productos }
  } catch (error: any) {
    console.error('Error en getProducts:', error?.response?.errors || error)
    return { productos: [], errorMessage: 'fallo al obtener los productos' }
  }
}
