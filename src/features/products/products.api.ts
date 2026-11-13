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
  orderBy?: 'title_ASC' | 'title_DESC'
}

export const getProducts = async (params?: GetProductsParams): Promise<productResponse> => {
  const { first = 100, skip = 0, where = {}, orderBy = 'title_ASC' } = params || {}

  try {
    const { productos } = await hygraphClient.request(
      gql`
        query GetProducts(
          $first: Int!
          $skip: Int!
          $where: Productos_idWhereInput
          $orderBy: Productos_idOrderByInput
        ) {
          productos(first: $first, skip: $skip, where: $where, orderBy: $orderBy) {
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
            healthCategory
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
        where: Object.keys(where).length > 0 ? where : {},
        orderBy,
      }
    )

    return { productos }
  } catch (error: any) {
    console.error('Error en getProducts:', error?.response?.errors || error)
    return { productos: [], errorMessage: 'fallo al obtener los productos' }
  }
}
