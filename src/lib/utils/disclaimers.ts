import { HealthCategory } from '@/features/products/products.model'

export const DISCLAIMER_COPY: Partial<Record<HealthCategory, string>> = {
  foodTraditional: '* Este producto no es un medicamento ni sustituye tratamiento médico.',
  cosmeticHealth: '* Producto cosmético: no es un medicamento.',
  supplement:
    '* Este producto no es un medicamento. El consumo de este producto es responsabilidad de quien lo recomienda y de quien lo usa.',
}

export const getDisclaimer = (category: HealthCategory) => DISCLAIMER_COPY[category] || null
