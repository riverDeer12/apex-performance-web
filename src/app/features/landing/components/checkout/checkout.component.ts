import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Button } from "primeng/button";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { InputText } from "primeng/inputtext";
import { ValidationService } from "../../../../shared/services/validation.service";
import { MessageService } from "primeng/api";
import { PaymentService } from "../../services/payment.service";
import { ShoppingCartService } from "../../services/shopping-cart.service";
import { CheckoutSession } from '../../models/checkout-session';

@Component({
  selector: "app-checkout",
  imports: [
    CommonModule,
    Button,
    FormsModule,
    InputText,
    ReactiveFormsModule
  ],
  templateUrl: "./checkout.component.html",
  styleUrl: "./checkout.component.scss",
})
export class CheckoutComponent implements OnInit {
  form!: FormGroup;

  loadingData = false;

  checkoutSession!: CheckoutSession;

  constructor(
    public validationService: ValidationService,
    private formBuilder: FormBuilder,
    private paymentService: PaymentService,
    private shoppingCartService: ShoppingCartService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  submit() {
    this.loadingData = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.messageService.add({
        severity: "warn",
        summary: "Incomplete or incorrect data",
        detail: "Check the entered data and try again.",
      });

      this.loadingData = false;

      return;
    }

    this.createCheckoutSession();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      address: ["", [Validators.required]],
      phone: ["", [Validators.required]],
      email: ["", [Validators.required]],
    });
  }

  private createCheckoutSession() {
    const checkoutSessionRequest = {
      customer: this.form.value,
      items: this.shoppingCartService.getShoppingCart(),
    };

    this.paymentService.createCheckoutSession(checkoutSessionRequest).subscribe({
      next: (response: any) => {
        this.checkoutSession = response;
      },
      error: (error) => {
        console.error("Error:", error);

        this.messageService.add({
          severity: "error",
          summary: "Error Creating Payment",
          detail: error.message || "An unexpected error occurred.",
        });
      },
      complete: () => {
        this.loadingData = false;
      },
    });
  }
}
