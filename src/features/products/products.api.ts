import { gql } from 'graphql-request'
import type { Product } from './products.model'
import { hygraphClient } from '@/lib/hygraph'
type productResponse = {
  productos: Product[] | []
  errorMessage?: string
}
export const getProducts = async (): Promise<productResponse> => {
  try {
    const { productos } = await hygraphClient.request(gql`
      {
        productos(first: 500) {
          id
          title
          description {
            html
          }
          image
          price
          previousPrice
          stock
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
            slug
            id
          }
          contenidoNeto
          unidad
        }
      }
    `)
    return { productos }
  } catch (error) {
    console.log(error)
    return { productos: [], errorMessage: 'fallo al obtener los productos' }
  }
}
