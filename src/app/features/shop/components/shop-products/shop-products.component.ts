import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { InputNumber } from "primeng/inputnumber";
import { Textarea } from "primeng/textarea";
import { Checkbox } from "primeng/checkbox";
import { Tag } from "primeng/tag";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { Dialog } from "primeng/dialog";
import { ConfirmationService, MessageService } from "primeng/api";
import { Observable } from "rxjs";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { getErrorMessage } from "../../../../constants/error-codes";
import { ShopService } from "../../services/shop.service";
import { formatPrice } from "../../utils/format-price";
import { environment } from "../../../../../environments/environment";
import { SaveShopProductRequest, ShopProduct, ShopVariant } from "../../models/shop";

interface ProductForm {
    name: string;
    slug: string;
    category: string;
    price: number | null;
    description: string;
    isActive: boolean;
    sortOrder: number;
    variants: ShopVariant[];
}

/**
 * Products of the webshop. Each product has variants (size and color)
 * with their own stock; a product without sizes has one variant with
 * both empty. Pictures are added once the product is saved.
 */
@Component({
    selector: "app-shop-products",
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, Button, InputText, InputNumber, Textarea, Checkbox, Tag,
        IconField, InputIcon, Dialog, TranslatePipe],
    templateUrl: "./shop-products.component.html",
})
export class ShopProductsComponent implements OnInit {
    products: ShopProduct[] = [];
    categories: string[] = [];
    loading = false;

    dialogVisible = false;
    // Product being edited, null while a new one is not saved yet.
    editing: ShopProduct | null = null;
    form: ProductForm = this.emptyForm();
    saving = false;
    uploading = false;

    constructor(
        public shopService: ShopService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private translationService: TranslationService,
    ) {}

    ngOnInit(): void {
        this.load();
    }

    formatPrice = formatPrice;

    // Demo catalog can be added on test only.
    readonly canUseDemo = !environment.production;
    demoBusy = false;

    totalStock = (product: ShopProduct) => product.variants.reduce((sum, x) => sum + x.stock, 0);

    variantName = (variant: ShopVariant) => [variant.size, variant.color].filter(Boolean).join(" / ");

    get formValid(): boolean {
        return !!this.form.name.trim() && !!this.form.category.trim() && !!this.form.description.trim() &&
            (this.form.price ?? 0) > 0 && this.form.variants.length > 0 &&
            this.form.variants.every((x) => x.stock >= 0);
    }

    openCreate(): void {
        this.editing = null;
        this.form = this.emptyForm();
        this.dialogVisible = true;
    }

    openEdit(product: ShopProduct): void {
        this.editing = product;
        this.form = {
            name: product.name,
            slug: product.slug,
            category: product.category,
            price: product.price,
            description: product.description,
            isActive: product.isActive,
            sortOrder: product.sortOrder,
            variants: product.variants.map((x) => ({ ...x })),
        };
        this.dialogVisible = true;
    }

    addVariant(): void {
        this.form.variants = [...this.form.variants, { id: null, size: null, color: null, stock: 0 }];
    }

    removeVariant(index: number): void {
        this.form.variants = this.form.variants.filter((_, i) => i !== index);
    }

    save(): void {
        if (!this.formValid || this.saving) return;

        this.saving = true;

        const request: SaveShopProductRequest = {
            name: this.form.name.trim(),
            slug: this.form.slug.trim() || null,
            category: this.form.category.trim(),
            price: this.form.price!,
            description: this.form.description.trim(),
            isActive: this.form.isActive,
            sortOrder: this.form.sortOrder ?? 0,
            variants: this.form.variants.map((x) => ({
                id: x.id ?? null,
                size: x.size?.trim() || null,
                color: x.color?.trim() || null,
                stock: x.stock ?? 0,
            })),
        };

        const isNew = !this.editing;
        const save$: Observable<ShopProduct> = this.editing
            ? this.shopService.updateProduct(this.editing.id, request)
            : this.shopService.createProduct(request);

        save$.subscribe({
            next: (product) => {
                this.saving = false;
                this.success(isNew ? "shop.productCreated" : "shop.productUpdated");
                this.load();

                // A new product stays open, so pictures can be added right away.
                if (isNew) this.openEdit(product);
                else this.dialogVisible = false;
            },
            error: (error) => {
                this.saving = false;
                this.error(error);
            },
        });
    }

    onFilesSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files ?? []);
        input.value = "";

        if (!this.editing || files.length === 0) return;

        this.uploading = true;
        this.updateImages(this.shopService.addImages(this.editing.id, files), () => (this.uploading = false));
    }

    moveImage(index: number, offset: number): void {
        if (!this.editing) return;

        const ids = [...this.editing.imageIds];
        const target = index + offset;
        if (target < 0 || target >= ids.length) return;

        [ids[index], ids[target]] = [ids[target], ids[index]];
        this.updateImages(this.shopService.reorderImages(this.editing.id, ids));
    }

    deleteImage(imageId: string): void {
        if (!this.editing) return;

        this.updateImages(this.shopService.deleteImage(this.editing.id, imageId));
    }

    confirmDelete(product: ShopProduct): void {
        this.confirmationService.confirm({
            message: this.translationService.t("shop.confirmDelete"),
            header: this.translationService.t("common.confirmDeletionHeader") + " " + product.name,
            closable: true,
            closeOnEscape: true,
            icon: "pi pi-exclamation-triangle",
            rejectButtonProps: { label: this.translationService.t("common.no"), severity: "secondary", outlined: true },
            acceptButtonProps: { label: this.translationService.t("common.yes"), severity: "danger" },
            accept: () => {
                this.shopService.deleteProduct(product.id).subscribe({
                    next: () => {
                        this.success("shop.productDeleted");
                        this.load();
                    },
                    error: (error) => this.error(error),
                });
            },
        });
    }

    addDemoProducts(): void {
        this.demoBusy = true;
        this.shopService.createDemoProducts().subscribe({
            next: (response) => {
                this.demoBusy = false;
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t("shop.demoAdded").replace("{count}", String(response.count)),
                });
                this.load();
            },
            error: (error) => {
                this.demoBusy = false;
                this.error(error);
            },
        });
    }

    removeDemoProducts(): void {
        this.demoBusy = true;
        this.shopService.deleteDemoProducts().subscribe({
            next: (response) => {
                this.demoBusy = false;
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t("shop.demoRemoved").replace("{count}", String(response.count)),
                });
                this.load();
            },
            error: (error) => {
                this.demoBusy = false;
                this.error(error);
            },
        });
    }

    private updateImages(request$: Observable<ShopProduct>, done?: () => void): void {
        request$.subscribe({
            next: (product) => {
                this.editing = product;
                this.products = this.products.map((x) => (x.id === product.id ? product : x));
                done?.();
            },
            error: (error) => {
                this.error(error);
                done?.();
            },
        });
    }

    private load(): void {
        this.loading = true;

        this.shopService.getProducts().subscribe({
            next: (products) => {
                this.products = products;
                this.categories = [...new Set(products.map((x) => x.category))].sort((a, b) => a.localeCompare(b));
                this.loading = false;
            },
            error: () => (this.loading = false),
        });
    }

    private emptyForm(): ProductForm {
        return {
            name: "",
            slug: "",
            category: "",
            price: null,
            description: "",
            isActive: false,
            sortOrder: 0,
            variants: [{ id: null, size: null, color: null, stock: 0 }],
        };
    }

    private success(key: string): void {
        this.messageService.add({
            severity: "success",
            summary: this.translationService.t("common.success"),
            detail: this.translationService.t(key),
        });
    }

    private error(error: unknown): void {
        this.messageService.add({
            severity: "error",
            summary: this.translationService.t("common.error"),
            detail: getErrorMessage(error),
        });
    }
}
