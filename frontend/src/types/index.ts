export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount?: number;
  iconName?: string;
  featured?: boolean;
};

export type Category = ProductCategory;

export type AttributeType = "COLOR" | "BUTTON" | "SELECT" | "IMAGE" | "TEXT";

export type VariationStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type GlobalAttributeValue = {
  id: string;
  attributeId: string;
  name: string;
  slug: string;
  colorHex?: string;
  imageUrl?: string;
  position: number;
  isActive: boolean;
};

export type GlobalAttribute = {
  id: string;
  name: string;
  slug: string;
  type: AttributeType;
  position: number;
  isActive: boolean;
  values: GlobalAttributeValue[];
  usageCount?: number;
};

export type ProductAttributeValueItem = {
  id: string;
  attributeValueId?: string;
  name: string;
  slug: string;
  colorHex?: string;
  imageUrl?: string;
  customValue?: string;
  position: number;
};

export type ProductAttributeConfig = {
  id: string;
  attributeId?: string;
  name: string;
  slug?: string;
  type: AttributeType;
  isCustom?: boolean;
  visible: boolean;
  usedForVariations: boolean;
  position: number;
  values: ProductAttributeValueItem[];
};

export type VariationAttributeItem = {
  attributeId?: string;
  attributeName: string;
  attributeValueId?: string;
  valueName: string;
  valueSlug?: string;
  colorHex?: string;
  imageUrl?: string;
};

export type ProductVariationItem = {
  id: string;
  productId?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  image?: string;
  weight?: number;
  barcode?: string;
  status: VariationStatus;
  isDefault: boolean;
  useBasePrice?: boolean;
  attributes: VariationAttributeItem[];
  canonicalKey?: string;
};

export type ProductType = "SIMPLE" | "VARIABLE";

export type ProductVariant = {
  id: string;
  name: string; // e.g. "Color: Space Gray", "Size: Standard"
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
  colorHex?: string;
  attributeType?: string; // "Color" | "Size" | "Option"
};

export type ProductSpecification = {
  label: string;
  value: string;
};

export type ProductReview = {
  id: string;
  authorName: string;
  authorLocation?: string;
  rating: number;
  date: string;
  comment: string;
  productName?: string;
  avatarUrl?: string;
  images?: string[];
  helpfulCount?: number;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice: number;
  category: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  stock: number;
  images: string[];
  videoUrl?: string;
  videoThumbnail?: string;
  badge?: "TRENDING" | "HOT" | "NEW" | "TOP RATED" | "BEST SELLER" | "LIMITED" | "SALE";
  tags: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isSpotlight?: boolean;
  isOnSale?: boolean;
  needCategory?: "desk-upgrade" | "everyday-utility" | "smart-kitchen" | "unique-gifts";
  features: string[];
  specifications: ProductSpecification[];
  productType?: ProductType;
  productAttributes?: ProductAttributeConfig[];
  productVariations?: ProductVariationItem[];
  defaultVariationId?: string;
  variants?: ProductVariant[];
  sku: string;
  deliveryDays?: string;
};

export type CartItem = {
  id: string; // unique item key: productId + variantId
  productId: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  quantity: number;
  selectedVariant?: ProductVariant;
  maxStock: number;
};

export type ShippingOption = {
  id: "inside-dhaka" | "outside-dhaka";
  name: string;
  cost: number;
  estimatedDays: string;
};

export type PaymentMethodType = "cod" | "bkash" | "nagad" | "card";

export type OrderSummary = {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  shippingOption: ShippingOption;
  discount: number;
  total: number;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    district: string;
    area: string;
    notes?: string;
  };
  paymentMethod: PaymentMethodType;
  createdAt: string;
  estimatedDeliveryDate: string;
  status: "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED";
};

export type NeedCollection = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  itemCount: number;
  filterTag: string;
};
