import { Injectable } from "@angular/core";
import { ShoppingCartItem } from "../models/shopping-cart-item";

@Injectable({
  providedIn: "root",
})
export class ShoppingCartService {
  constructor() {}

  getShoppingCart(): ShoppingCartItem[] {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  }

  getShoppingCartSubtotal(): number {
    let shoppingCart = this.getShoppingCart();
    return shoppingCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }

  addToShoppingCart(shoppingCartItem: ShoppingCartItem) {
    let shoppingCart = this.getShoppingCart();

    let existingShoppingCartItem = shoppingCart.find(
      (item) => item.id === shoppingCartItem.id,
    );

    if (existingShoppingCartItem) {
      existingShoppingCartItem.quantity += 1;
    } else {
      shoppingCart.push(shoppingCartItem);
    }

    this.saveShoppingCart(shoppingCart);
  }

  removeFromShoppingCart(shoppingCartItemId: string) {
    let shoppingCart = this.getShoppingCart();

    shoppingCart = shoppingCart.filter(
      (item) => item.id !== shoppingCartItemId,
    );

    this.saveShoppingCart(shoppingCart);
  }

  removeShoppingCartItemQuantity(shoppingCartItem: ShoppingCartItem) {
    let shoppingCart = this.getShoppingCart();

    let existingShoppingCartItem = shoppingCart.find(
      (item) => item.id === shoppingCartItem.id,
    );

    if (!existingShoppingCartItem) {
      return;
    } else {
      if(existingShoppingCartItem.quantity == 1){
        this.removeFromShoppingCart(shoppingCartItem.id);
      } else {
        existingShoppingCartItem.quantity = existingShoppingCartItem.quantity - 1;

        this.saveShoppingCart(shoppingCart);
      }
    }
  }

  clearShoppingCart(): void {
    localStorage.removeItem("cart");
  }

  private saveShoppingCart(shoppingCart: ShoppingCartItem[]) {
    localStorage.setItem("cart", JSON.stringify(shoppingCart));
  }
}
