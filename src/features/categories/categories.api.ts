import { hygraphClient } from '@/lib/hygraph'
import type { Image } from '../products/products.model'
import { gql } from 'graphql-request'

export interface TrustBadge {
  id: string
  icon: string
  title: string
  description: string
}
export interface Category {
  id: string
  name: string
  slug: string
  heroTitle: string
  heroTitleStrong: string
  heroDescription: string // si es Rich Text, sería { html: string }
  image: Image[] | []
  isActive: boolean
  trustBadges: TrustBadge[]
}
type categoriesResponse = {
  categories: Category[] | []
  errorMessage?: string
}
export const getCategories = async (): Promise<categoriesResponse> => {
  try {
    const { categories } = await hygraphClient.request(gql`
      {
        categories(where: { isActive: true }) {
          id
          name
          image
          slug
          heroTitle
          heroTitleStrong
          heroDescription
          isActive
          trustBadges {
            id
            icon
            title
            description
          }
        }
      }
    `)
    console.log(categories)
    return { categories }
  } catch (error) {
    console.error('fallo al obtener las categorias', error)
    return { categories: [], errorMessage: 'Sin conexión' }
  }
}
