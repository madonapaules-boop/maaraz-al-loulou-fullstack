export type ProductImage = {
  id: number;
  imageUrl: string;
  isMainImage: boolean;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  finalPrice: number;
  categoryId: number;
  categoryNameArabic: string;
  color: string;
  stockQuantity: number;
  isAvailable: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isOnOffer: boolean;
  createdAt: string;
  images: ProductImage[];
};

export type Category = {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  description: string | null;
};

export const mainImage = (product: Product) =>
  product.images.find(image => image.isMainImage)?.imageUrl ||
  product.images[0]?.imageUrl ||
  "/images/al-loulou-hero.jpg";
export const formatPrice = (price: number) =>
  `${new Intl.NumberFormat("ar-EG").format(price)} ج.م`;
