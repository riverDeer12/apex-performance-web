import { Component, OnInit } from "@angular/core";
import { ProductService } from "../../../products/services/product.service";
import { Product } from "../../../products/models/product";
import { DataView } from "primeng/dataview";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Button } from "primeng/button";
import { ShoppingCartItem } from "../../models/shopping-cart-item";
import { ShoppingCartService } from "../../services/shopping-cart.service";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-shop",
  standalone: true,
  imports: [CommonModule, DataView, FormsModule, Button],
  templateUrl: "./shop.component.html",
  styleUrl: "./shop.component.scss",
})
export class ShopComponent implements OnInit {
  products!: Product[];

  constructor(
    private productService: ProductService,
    private shoppingCartService: ShoppingCartService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.productService.getPublicProducts().subscribe((response: Product[]) => {
      this.products = response.map((x: Product) =>
        Object.assign(new Product(), x),
      );
    });
  }

  addProductToShoppingCart(product: Product): void {
    const shoppingCartItem = new ShoppingCartItem(product);
    this.shoppingCartService.addToShoppingCart(shoppingCartItem);
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: product.name + " added to shopping cart.",
    });
  }
}
