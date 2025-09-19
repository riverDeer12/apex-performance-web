import { Component, OnInit } from "@angular/core";
import { ShoppingCartItem } from "../../models/shopping-cart-item";
import { ShoppingCartService } from "../../services/shopping-cart.service";
import { DataView } from 'primeng/dataview';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';

@Component({
  selector: "app-checkout",
  imports: [CommonModule, DataView, Button],
  templateUrl: "./checkout.component.html",
  styleUrl: "./checkout.component.scss",
})
export class CheckoutComponent implements OnInit {
  shoppingCartItems!: ShoppingCartItem[];

  constructor(private shoppingCartService: ShoppingCartService) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData(): void {
    this.shoppingCartItems = this.shoppingCartService.getShoppingCart();
  }

  updateShoppingCartItemQuantity(shoppingCartItem: ShoppingCartItem): void {
    this.shoppingCartService.addToShoppingCart(shoppingCartItem);
    this.loadData();
  }

  removeShoppingCartItemQuantity(shoppingCartItem: ShoppingCartItem): void {
    this.shoppingCartService.removeShoppingCartItemQuantity(shoppingCartItem);
    this.loadData();
  }

  removeShoppingCartItem(shoppingCartItem: ShoppingCartItem): void {
    this.shoppingCartService.removeFromShoppingCart(shoppingCartItem.id);
    this.loadData();
  }
}
