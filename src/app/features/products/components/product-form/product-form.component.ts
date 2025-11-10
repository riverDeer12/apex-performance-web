import { Component, Input, OnInit } from "@angular/core";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { CommonModule, NgIf } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActionType } from "../../../../enums/action-type";
import { RedirectType } from "../../../../enums/redirect-type";
import { ValidationService } from "../../../../shared/services/validation.service";
import { HelperService } from "../../../../shared/services/helper.service";
import { MessageService } from "primeng/api";
import { Product } from "../../models/product";
import { ProductService } from "../../services/product.service";
import { InputNumber } from "primeng/inputnumber";
import {
  FileRemoveEvent,
  FileSelectEvent,
  FileUpload,
} from "primeng/fileupload";

@Component({
  selector: "app-product-form",
  imports: [
    CommonModule,
    Button,
    InputText,
    NgIf,
    ReactiveFormsModule,
    InputNumber,
    FileUpload,
  ],
  templateUrl: "./product-form.component.html",
  styleUrl: "./product-form.component.scss",
})
export class ProductFormComponent implements OnInit {
  @Input() type!: ActionType;
  @Input() product!: Product;
  @Input() redirectType!: RedirectType;
  @Input() dialogId!: string;
  @Input() returnUrl!: string;

  form!: FormGroup;

  loadingData = false;

  constructor(
    public validationService: ValidationService,
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private productService: ProductService,
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

    this.type == ActionType.Create
      ? this.createProduct()
      : this.updateProduct();
  }

  onSelect(event: FileSelectEvent) {
    const selected = event.files;
    const current = this.form.value.photos ?? [];
    this.form.patchValue({ photos: [...current, ...selected] });
  }

  onRemove(event: FileRemoveEvent) {
    const removedFile = event.file;
    const current = this.form.value.photos ?? [];
    this.form.patchValue({
      photos: current.filter((f: File) => f !== removedFile),
    });
  }

  private initForm = () =>
    this.type == ActionType.Create
      ? this.initCreateForm()
      : this.initUpdateForm();

  private initCreateForm() {
    this.form = this.formBuilder.group({
      photos: [[], [Validators.required]],
      name: ["", [Validators.required]],
      description: ["", [Validators.required]],
      price: ["", [Validators.required]],
    });
  }

  private initUpdateForm() {
    this.form = this.formBuilder.group({
      photos: [this.product.photos, [Validators.required]],
      name: [this.product.name, [Validators.required]],
      description: [this.product.description, [Validators.required]],
      price: [this.product.price, [Validators.required]],
    });
  }

  private createProduct() {
    this.productService.createProduct(this.form.value).subscribe({
      next: (response: Product) => {
        this.product = Object.assign(new Product(), response);

        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Product is created successfully.",
        });

        this.helperService.redirectUserAfterSubmit(
          this.redirectType,
          this.returnUrl,
          this.dialogId,
        );
      },
      error: (error) => {
        console.error("Error:", error);

        this.messageService.add({
          severity: "error",
          summary: "Error Creating Product",
          detail: error.message || "An unexpected error occurred.",
        });
      },
      complete: () => {
        this.loadingData = false;
      },
    });
  }

  private updateProduct() {
    this.productService
      .updateProduct(this.product.id, this.form.value)
      .subscribe({
        next: (response: Product) => {
          this.product = Object.assign(new Product(), response);

          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Product is updated successfully.",
          });

          this.helperService.redirectUserAfterSubmit(
            this.redirectType,
            this.returnUrl,
            this.dialogId,
          );
        },
        error: (error) => {
          console.error("Error:", error);

          this.messageService.add({
            severity: "error",
            summary: "Error Updating Product",
            detail: error.message || "An unexpected error occurred.",
          });
        },
        complete: () => {
          this.loadingData = false;
        },
      });
  }
}
