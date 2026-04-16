import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { switchMap } from "rxjs";
import { DefaultPostRequest } from "../../../shared/models/default-post-request";
import { environment } from "../../../../environments/environment";
import {loadStripe, Stripe} from "@stripe/stripe-js";

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
            .post<{ url: string }>(environment.apiUrl + "/payments", request)
            .pipe(
                switchMap(async (response) => {
                    window.location.href = response.url;
                })
            );
    }
}
