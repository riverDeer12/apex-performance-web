import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { switchMap } from "rxjs";
import { DefaultPostRequest } from "../../../shared/models/default-post-request";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  private stripe: Stripe | null = null;

  constructor(private http: HttpClient) {
    this.initStripe();
  }

  private async initStripe() {
    this.stripe = await loadStripe(environment.stripe.publishableKey);
  }

  createCheckoutSession(request: DefaultPostRequest) {
    return this.http
      .post<{ sessionId: string }>(environment.apiUrl + "/payments", request)
      .pipe(
        switchMap(async (response) => {
          const stripe = await this.stripe;

          if (!stripe) {
            throw new Error("Stripe failed to initialize");
          }

          const { error } = await stripe.redirectToCheckout({
            sessionId: response.sessionId,

          });

          if (error) {
            throw new Error(error.message);
          }
        }),
      );
  }
}
