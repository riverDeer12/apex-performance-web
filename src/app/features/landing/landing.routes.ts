import { Routes } from "@angular/router";
import { ShopComponent } from "./components/shop/shop.component";
import { LandingComponent } from "./landing.component";
import { CheckoutComponent } from "./components/checkout/checkout.component";
import { ShoppingCartComponent } from "./components/shopping-cart/shopping-cart.component";
import { SuccessfulPaymentComponent } from "./components/successful-payment/successful-payment.component";
import { UnsuccessfulPaymentComponent } from "./components/unsuccessful-payment/unsuccessful-payment.component";

export const LandingRoutes: Routes = [
  {
    path: "",
    component: LandingComponent,
    children: [
      {
        path: "checkout",
        component: CheckoutComponent,
      },
      {
        path: "shop",
        component: ShopComponent,
      },
      {
        path: "shopping-cart",
        component: ShoppingCartComponent,
      },
      {
        path: "successful-payment",
        component: SuccessfulPaymentComponent,
      },
      {
        path: "unsuccessful-payment",
        component: UnsuccessfulPaymentComponent,
      },
    ],
  },
];
