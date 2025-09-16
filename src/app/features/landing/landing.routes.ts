import { Routes } from "@angular/router";
import { ShopComponent } from "./components/shop/shop.component";
import { LandingComponent } from "./landing.component";

export const LandingRoutes: Routes = [
  {
    path: "",
    component: LandingComponent,
    children: [
      {
        path: "shop",
        component: ShopComponent
      },
    ]
  }
];
