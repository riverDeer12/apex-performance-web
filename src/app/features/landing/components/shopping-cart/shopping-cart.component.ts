import { Component, OnInit } from "@angular/core";
import { ShoppingCartItem } from '../../models/shopping-cart-item';
import { ShoppingCartService } from '../../services/shopping-cart.service';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DataView } from 'primeng/dataview';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from "@angular/router";

@Component({
  selector: "app-shopping-cart",
  imports: [CommonModule, Button, DataView, DecimalPipe],
  templateUrl: "./shopping-cart.component.html",
  styleUrl: "./shopping-cart.component.scss",
})
export class ShoppingCartComponent implements OnInit {
  shoppingCartItems!: ShoppingCartItem[];

  constructor(
    private shoppingCartService: ShoppingCartService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  updateShoppingCartItemQuantity(shoppingCartItem: ShoppingCartItem): void {
    this.shoppingCartService.addToShoppingCart(shoppingCartItem);
    this.loadData();
    this.messageService.add({
      severity: "info",
      summary: "Info",
      detail: shoppingCartItem.name + " quantity updated.",
    });
  }

  removeShoppingCartItemQuantity(shoppingCartItem: ShoppingCartItem): void {
    this.shoppingCartService.removeShoppingCartItemQuantity(shoppingCartItem);
    this.loadData();
    this.messageService.add({
      severity: "info",
      summary: "Info",
      detail: shoppingCartItem.name + " quantity updated.",
    });
  }

  removeShoppingCartItem(shoppingCartItem: ShoppingCartItem): void {
    this.shoppingCartService.removeFromShoppingCart(shoppingCartItem.id);
    this.loadData();
    this.messageService.add({
      severity: "info",
      summary: "Info",
      detail: shoppingCartItem.name + "  removed from shopping cart.",
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

  goToCheckout(): void {
    this.router.navigateByUrl("/checkout").then();
  }

  private loadData(): void {
    this.shoppingCartItems = this.shoppingCartService.getShoppingCart();
  }
}
