import { GraphQLClient } from 'graphql-request'
import { HYGRAPH_API_URL, HYGRAPH_TOKEN } from 'astro:env/server'
const apiUrl = HYGRAPH_API_URL || ''
const token = HYGRAPH_TOKEN

export const hygraphClient = new GraphQLClient(apiUrl, {
  headers: token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {},
})
