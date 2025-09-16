import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { DialogService } from "primeng/dynamicdialog";
import { ConfirmationService, MessageService } from "primeng/api";
import { HelperService } from "../../shared/services/helper.service";
import { Table, TableModule } from "primeng/table";
import { DialogFormComponent } from "../../shared/components/dialog-form/dialog-form.component";
import { EntityType } from "../../enums/entity-type";
import { ActionType } from "../../enums/action-type";
import { DialogInfoComponent } from "../../shared/components/dialog-info/dialog-info.component";
import { Product } from "./models/product";
import { ProductService } from "./services/product.service";
import { Button, ButtonDirective } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { InputIcon } from "primeng/inputicon";
import { IconField } from "primeng/iconfield";
import { CommonModule, DatePipe } from "@angular/common";

@Component({
  selector: "app-products",
  imports: [
    CommonModule,
    Button,
    DatePipe,
    TableModule,
    ButtonDirective,
    InputText,
    InputIcon,
    IconField,
  ],
  providers: [DialogService],
  templateUrl: "./products.component.html",
  styleUrl: "./products.component.scss",
})
export class ProductsComponent implements OnInit {
  @Input() products!: Product[];

  @ViewChild(`filter`) filter!: ElementRef;

  constructor(
    private productService: ProductService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private helperService: HelperService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.getDataStatus();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = "";
  }

  openCreateDialog() {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: "Add New Product",
      data: {
        contentType: EntityType.Product,
        formType: ActionType.Create,
        dialogId: "createProductForm",
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    });
  }

  openInfoDialog(product: Product) {
    this.dialogService.open(DialogInfoComponent, {
      header: "Details for: " + product.name,
      data: {
        contentType: EntityType.Product,
        data: product,
      },
    });
  }

  openUpdateDialog(product: Product) {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: "Update data for: " + product.name,
      data: {
        contentType: EntityType.Product,
        formType: ActionType.Update,
        dialogId: "updateProductForm",
        data: product,
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    });
  }

  changeActivity(product: Product) {
    this.confirmationService.confirm({
      message: "Are you sure that you want to change activity for this product?",
      header: "Confirm activity change of " + product.name,
      closable: true,
      closeOnEscape: true,
      icon: "pi pi-exclamation-triangle",
      rejectButtonProps: {
        label: "No",
        severity: "secondary",
        outlined: true,
      },
      acceptButtonProps: {
        label: "Yes",
      },
      accept: () => {
        this.productService.changeProductActivity(product.id).subscribe(
            () => {
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Product activity has been changed.",
              });

              this.loadData();

            },
            () => {
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Error changing product activity.",
              });
            },
        );
      },
    });
  }

  private loadData() {
    this.productService.getProducts().subscribe((response: Product[]) => {
      if(response){
        this.products = response.map((x: Product) =>
            Object.assign(new Product(), x),
        );
      }
    });
  }

  private getDataStatus() {
    this.helperService.getDataStatus().subscribe((response: boolean) => {
      if (response) {
        this.loadData();
      }
    });
  }
}
