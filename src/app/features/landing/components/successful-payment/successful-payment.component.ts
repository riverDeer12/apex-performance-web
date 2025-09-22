import { Component } from "@angular/core";
import { ShoppingCartService } from "../../services/shopping-cart.service";

@Component({
  selector: "app-successful-payment",
  imports: [],
  templateUrl: "./successful-payment.component.html",
  styleUrl: "./successful-payment.component.scss",
})
export class SuccessfulPaymentComponent {
  constructor(private shoppingCartService: ShoppingCartService) {
    this.shoppingCartService.clearShoppingCart();
  }
}
