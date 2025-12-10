import { hygraphClient } from '@/lib/hygraph'
import type { Image } from '../products/products.model'
import { gql } from 'graphql-request'

export interface Category {
  id: string
  name: string
  slug: string
  description: { html: string }
  image: Image[] | []
  isActive: boolean
}
type categoriesResponse = {
  categories: Category[] | []
  errorMessage?: string
}
export const getCategories = async (): Promise<categoriesResponse> => {
  try {
    const { categories } = await hygraphClient.request(gql`
      {
        categories {
          id
          name
          slug
          description {
            html
          }
          isActive
        }
      }
    `)
    return { categories }
  } catch (error) {
    console.log(error)
    return { categories: [], errorMessage: 'fallo al obtener las categorias' }
  }
}
