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
