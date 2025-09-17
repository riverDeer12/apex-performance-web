import { Product } from "../../products/models/product";

export class ShoppingCartItem {

  constructor(product: Product) {
    this.id = product.id;
    this.name = product.name;
    this.price = product.price;
    this.quantity = 1;
  }

  id!: string;
  name!: string;
  price!: number;
  quantity!: number;
}
