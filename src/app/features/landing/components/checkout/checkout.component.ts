import { Component, OnInit } from "@angular/core";
import { ShoppingCartItem } from "../../models/shopping-cart-item";
import { ShoppingCartService } from "../../services/shopping-cart.service";
import { DataView } from "primeng/dataview";
import { CommonModule } from "@angular/common";
import { Button } from "primeng/button";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-checkout",
  imports: [CommonModule, DataView, Button],
  templateUrl: "./checkout.component.html",
  styleUrl: "./checkout.component.scss",
})
export class CheckoutComponent implements OnInit {
  shoppingCartItems!: ShoppingCartItem[];

  constructor(
    private shoppingCartService: ShoppingCartService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData(): void {
    this.shoppingCartItems = this.shoppingCartService.getShoppingCart();
  }

  updateShoppingCartItemQuantity(shoppingCartItem: ShoppingCartItem): void {
    this.shoppingCartService.addToShoppingCart(shoppingCartItem);
    this.loadData();
    this.messageService.add({
      severity: "info",
      summary: "Info",
      detail: "Updated shopping cart item quantity.",
    });
  }

  removeShoppingCartItemQuantity(shoppingCartItem: ShoppingCartItem): void {
    this.shoppingCartService.removeShoppingCartItemQuantity(shoppingCartItem);
    this.loadData();
    this.messageService.add({
      severity: "info",
      summary: "Info",
      detail: "Removed shopping cart item quantity.",
    });
  }

  removeShoppingCartItem(shoppingCartItem: ShoppingCartItem): void {
    this.shoppingCartService.removeFromShoppingCart(shoppingCartItem.id);
    this.loadData();
    this.messageService.add({
      severity: "info",
      summary: "Info",
      detail: "Product removed from shopping cart.",
    });
  }

  clearShoppingCart(): void {
    this.shoppingCartService.clearShoppingCart();
    this.loadData();
    this.messageService.add({
      severity: "info",
      summary: "Info",
      detail: "Cleared shopping cart.",
    });
  }
}
