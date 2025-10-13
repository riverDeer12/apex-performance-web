import { Component } from "@angular/core";
import { ShoppingCartService } from "../../services/shopping-cart.service";
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: "app-successful-payment",
  imports: [Button, RouterLink],
  templateUrl: "./successful-payment.component.html",
  styleUrl: "./successful-payment.component.scss",
})
export class SuccessfulPaymentComponent {
  constructor(private shoppingCartService: ShoppingCartService) {
    this.shoppingCartService.clearShoppingCart();
  }
}
