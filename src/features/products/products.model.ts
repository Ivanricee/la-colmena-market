type htmlString = {
  html: string;
};
type ProductStatus = "active" | "inactive" | "out_of_stock";
type Category = {
  slug: string;
};
export interface Product {
  id: string;
  title: string;
  description: htmlString;
  image: Image[] | [];
  price: number;
  previousPrice: number;
  stock: number;
  brand: string;
  productStatus: ProductStatus;
  featured: boolean;
  weight: number;
  specifications: htmlString;
  benefits: string[];
  tags: string[];
  category: Category;
  contenidoNeto: number;
  unidad: string;
}
/**
 * cloudinary image
 */
interface DerivedTransformation {
  url: string;
  secure_url: string;
  raw_transformation: string;
}

interface UserInfo {
  id: string;
  type: "accesskey" | "user";
}

export interface Image {
  id: string;
  url: string;
  tags: string[];
  type: string;
  bytes: number;
  width: number;
  folder: string;
  format: string;
  height: number;
  derived: DerivedTransformation[];
  version: number;
  duration: number | null;
  metadata: Record<string, any>;
  folder_id: string;
  public_id: string;
  created_at: string;
  created_by: UserInfo;
  secure_url: string;
  access_mode: string;
  uploaded_by: UserInfo;
  resource_type: string;
  access_control: any[];
}
