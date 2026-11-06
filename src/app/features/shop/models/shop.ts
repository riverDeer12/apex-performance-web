export interface ShopVariant {
    // Missing for a variant not saved yet.
    id?: string | null;
    size: string | null;
    color: string | null;
    stock: number;
}

export interface ShopProduct {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    price: number;
    isActive: boolean;
    sortOrder: number;
    // First one is the main picture.
    imageIds: string[];
    variants: ShopVariant[];
    // Words customers filter and search by in the shop.
    keywords: string[];
    // Products picked to go with this one, in the shown order.
    relatedProductIds: string[];
}

export interface SaveShopProductRequest {
    name: string;
    slug: string | null;
    description: string;
    category: string;
    price: number;
    isActive: boolean;
    sortOrder: number;
    variants: ShopVariant[];
    keywords: string[];
    relatedProductIds: string[];
}

export type ShopOrderStatus = "Pending" | "Paid" | "Shipped" | "Cancelled" | "Refunded";

export interface ShopOrderItem {
    productName: string;
    variantName: string | null;
    unitPrice: number;
    // Promo code discount per piece.
    unitDiscount: number;
    quantity: number;
}

export interface ShopOrder {
    id: string;
    number: string;
    status: ShopOrderStatus;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    subtotal: number;
    promoCode: string | null;
    discount: number;
    shippingPrice: number;
    total: number;
    boxNowLockerId: string;
    boxNowLockerAddress: string;
    boxNowLockerPostalCode: string;
    boxNowParcelId: string | null;
    hasStockIssue: boolean;
    createdAt: string;
    paidAt: string | null;
    shippedAt: string | null;
    // From Stripe webhooks.
    refundedAmount: number;
    refundedAt: string | null;
    disputeStatus: string | null;
    disputedAt: string | null;
    hasFraudWarning: boolean;
    items: ShopOrderItem[];
    // Client discount used on some products, null when none.
    clientDiscountPercent: number | null;
}

export type ShopDiscountType = "Percent" | "Amount";

export interface ShopPromoCode {
    id: string;
    code: string;
    discountType: ShopDiscountType;
    discountValue: number;
    validFrom: string | null;
    validUntil: string | null;
    maxUses: number | null;
    isActive: boolean;
    note: string | null;
    // Empty when the code is for all products.
    productIds: string[];
    uses: number;
    totalDiscount: number;
}

export interface SaveShopPromoCodeRequest {
    code: string;
    discountType: ShopDiscountType;
    discountValue: number;
    validFrom: string | null;
    validUntil: string | null;
    maxUses: number | null;
    isActive: boolean;
    note: string | null;
    productIds: string[];
}

export type ShopStockReason = "Initial" | "Receipt" | "Correction" | "WriteOff" | "Sale" | "Return";

export interface ShopStockRow {
    variantId: string;
    productId: string;
    productName: string;
    category: string;
    size: string | null;
    color: string | null;
    stock: number;
    price: number;
    productIsActive: boolean;
    imageId: string | null;
    soldLast30Days: number;
    lastMovementAt: string | null;
    // Customers waiting for an email when it is back in stock.
    waitingAlerts: number;
}

export interface ShopStockMovement {
    id: string;
    change: number;
    stockAfter: number;
    reason: ShopStockReason;
    note: string | null;
    orderNumber: string | null;
    createdByName: string | null;
    createdAt: string;
}

export interface ShopAdminSettings {
    // Empty uses the default from the server settings.
    shippingPrice: number | null;
    freeShippingFrom: number | null;
    clientDiscountPercent: number;
    notificationEmail: string | null;
    defaultShippingPrice: number;
    defaultFreeShippingFrom: number;
    defaultNotificationEmail: string;
}

export interface ShopStatsDay {
    date: string;
    visits: number;
    productViews: number;
    orders: number;
    revenue: number;
}

export interface ShopStats {
    days: number;
    visits: number;
    productViews: number;
    cartViews: number;
    orders: number;
    revenue: number;
    perDay: ShopStatsDay[];
    products: ShopStatsProduct[];
    // Sold out sizes and colors people are waiting for now.
    waitingList?: ShopStatsWaiting[] | null;
}

export interface ShopStatsProduct {
    slug: string;
    name: string;
    views: number;
    soldPieces: number;
    // Put in the cart and marked with the heart in the period, by anyone.
    addedToCart?: number;
    favoriteAdds?: number;
    // Members who have it in their saved favorites now.
    savedFavorites?: number;
    // People waiting for a sold out size or color now.
    waiting?: number;
}

export interface ShopStatsWaiting {
    productName: string;
    slug: string;
    size: string | null;
    color: string | null;
    waiting: number;
    since: string;
    // Above 0 while people still wait: their email was not sent (it goes out when stock goes from 0 up).
    stock: number;
}
