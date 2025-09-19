import { Routes } from "@angular/router";
import { ShopComponent } from "./components/shop/shop.component";
import { LandingComponent } from "./landing.component";
import { CheckoutComponent } from "./components/checkout/checkout.component";

export const LandingRoutes: Routes = [
  {
    path: "",
    component: LandingComponent,
    children: [
      {
        path: "shop",
        component: ShopComponent
      },
      {
        path: "checkout",
        component: CheckoutComponent
      },
    ]
  }
];
