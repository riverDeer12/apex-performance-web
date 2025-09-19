import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ShoppingCartService } from "./shopping-cart.service";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { Payment } from "../models/payment";
import { ShoppingCartItem } from "../models/shopping-cart-item";

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  constructor(
    private http: HttpClient,
    private shoppingCartService: ShoppingCartService,
  ) {}

  createPayment = (shoppingCartItems: ShoppingCartItem[]) =>
    this.http.post(environment.apiUrl + "/payments", shoppingCartItems);
}
