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

export type ShopOrderStatus = "Pending" | "Paid" | "Shipped" | "Cancelled";

export interface ShopOrderItem {
    productName: string;
    variantName: string | null;
    unitPrice: number;
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
    items: ShopOrderItem[];
}
