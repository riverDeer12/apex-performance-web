import { Component, OnInit } from "@angular/core";
import { MenuItem } from "primeng/api";
import { BadgeModule } from "primeng/badge";
import { AvatarModule } from "primeng/avatar";
import { InputTextModule } from "primeng/inputtext";
import { CommonModule } from '@angular/common';
import { Ripple } from "primeng/ripple";
import { Menubar } from "primeng/menubar";
import { AppConfigurator } from "../app.configurator";
import { LayoutService } from "../../service/layout.service";
import { Router } from "@angular/router";
import { ShoppingCartService } from "../../../features/landing/services/shopping-cart.service";

@Component({
  selector: "app-public-menu",
  imports: [
    CommonModule,
    Menubar,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    Ripple,
    CommonModule,
    AppConfigurator
  ],
  templateUrl: "./public-menu.component.html",
  styleUrl: "./public-menu.component.scss",
})
export class PublicMenuComponent implements OnInit {
  items: MenuItem[] | undefined;

  get showShoppingCart(): boolean {
    return this.shoppingCartService.getShoppingCartTotalQuantity() > 0;
  }

  constructor(public layoutService: LayoutService,
              private shoppingCartService: ShoppingCartService,
              private router: Router) {}

  ngOnInit() {
    this.items = [
      {
        label: "Home",
      },
      {
        label: "About",
      },
      {
        label: "Shop",
        routerLink: ["/shop"],
      },
      {
        label: "Contact",
      },
    ];
  }

  goToShoppingCartPage(): void {
    this.router.navigateByUrl("/shopping-cart").then();
  }

  goToCheckoutPage(): void {
    this.router.navigateByUrl("/checkout").then();
  }

  getShoppingCartTotalQuantity(): number {
    return this.shoppingCartService.getShoppingCartTotalQuantity()
  }

  getShoppingCartSubtotal(): number {
    return this.shoppingCartService.getShoppingCartSubtotal()
  }
}
