import { Routes } from "@angular/router";
import { ShopProductsComponent } from "./components/shop-products/shop-products.component";
import { ShopOrdersComponent } from "./components/shop-orders/shop-orders.component";
import { ShopPromoCodesComponent } from "./components/shop-promo-codes/shop-promo-codes.component";
import { ShopStockComponent } from "./components/shop-stock/shop-stock.component";

export const ShopRoutes: Routes = [
    { path: "", pathMatch: "full", redirectTo: "products" },
    {
        path: "products",
        component: ShopProductsComponent,
        data: { title: "menu.shopProducts", section: "menu.shop" },
    },
    {
        path: "orders",
        component: ShopOrdersComponent,
        data: { title: "menu.shopOrders", section: "menu.shop" },
    },
    {
        path: "stock",
        component: ShopStockComponent,
        data: { title: "menu.shopStock", section: "menu.shop" },
    },
    {
        path: "promo-codes",
        component: ShopPromoCodesComponent,
        data: { title: "menu.shopPromoCodes", section: "menu.shop" },
    },
];
