import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { InputNumber } from "primeng/inputnumber";
import { Select } from "primeng/select";
import { MultiSelect } from "primeng/multiselect";
import { DatePicker } from "primeng/datepicker";
import { Checkbox } from "primeng/checkbox";
import { Tag } from "primeng/tag";
import { Dialog } from "primeng/dialog";
import { ConfirmationService, MessageService } from "primeng/api";
import { Observable, forkJoin } from "rxjs";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { getErrorMessage } from "../../../../constants/error-codes";
import { ShopService } from "../../services/shop.service";
import { SaveShopPromoCodeRequest, ShopDiscountType, ShopProduct, ShopPromoCode } from "../../models/shop";
import { formatPrice } from "../../utils/format-price";

interface PromoForm {
    code: string;
    discountType: ShopDiscountType;
    discountValue: number | null;
    validFrom: Date | null;
    validUntil: Date | null;
    maxUses: number | null;
    isActive: boolean;
    note: string;
    productIds: string[];
}

/**
 * Promo codes of the webshop: a percent or an amount off each piece of
 * the chosen products (all when none is chosen), with optional dates
 * and a limit of paid orders.
 */
@Component({
    selector: "app-shop-promo-codes",
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, Button, InputText, InputNumber, Select, MultiSelect, DatePicker,
        Checkbox, Tag, Dialog, TranslatePipe],
    templateUrl: "./shop-promo-codes.component.html",
})
export class ShopPromoCodesComponent implements OnInit {
    promoCodes: ShopPromoCode[] = [];
    products: ShopProduct[] = [];
    loading = false;

    dialogVisible = false;
    editing: ShopPromoCode | null = null;
    form: PromoForm = this.emptyForm();
    saving = false;

    formatPrice = formatPrice;

    constructor(
        private shopService: ShopService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private translationService: TranslationService,
    ) {
        this.discountTypes = [
            { label: translationService.t("shop.discountPercent"), value: "Percent" },
            { label: translationService.t("shop.discountAmount"), value: "Amount" },
        ];
    }

    // Made once: PrimeNG redraws its options whenever it gets a new array.
    readonly discountTypes: { label: string; value: string }[];

    get formValid(): boolean {
        const value = this.form.discountValue ?? 0;

        return /^[A-Za-z0-9_-]{3,40}$/.test(this.form.code.trim()) && value > 0 &&
            (this.form.discountType === "Amount" || value <= 100) &&
            (!this.form.validFrom || !this.form.validUntil || this.form.validUntil > this.form.validFrom);
    }

    ngOnInit(): void {
        this.load();
    }

    discountLabel = (promo: ShopPromoCode) =>
        promo.discountType === "Percent" ? `${promo.discountValue} %` : formatPrice(promo.discountValue);

    productNames(promo: ShopPromoCode): string {
        if (promo.productIds.length === 0) return this.translationService.t("shop.allProducts");

        return promo.productIds
            .map((id) => this.products.find((x) => x.id === id)?.name ?? "?")
            .join(", ");
    }

    // Active, but outside its dates or used up, so customers can't use it.
    state(promo: ShopPromoCode): { key: string; severity: "success" | "secondary" | "warn" } {
        const now = new Date();

        if (!promo.isActive) return { key: "shop.promoInactive", severity: "secondary" };
        if (promo.validFrom && new Date(promo.validFrom) > now) return { key: "shop.promoNotYet", severity: "warn" };
        if (promo.validUntil && new Date(promo.validUntil) < now) return { key: "shop.promoExpired", severity: "secondary" };
        if (promo.maxUses !== null && promo.uses >= promo.maxUses) return { key: "shop.promoUsedUp", severity: "secondary" };

        return { key: "shop.promoActive", severity: "success" };
    }

    openCreate(): void {
        this.editing = null;
        this.form = this.emptyForm();
        this.dialogVisible = true;
    }

    openEdit(promo: ShopPromoCode): void {
        this.editing = promo;
        this.form = {
            code: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            validFrom: promo.validFrom ? new Date(promo.validFrom) : null,
            validUntil: promo.validUntil ? new Date(promo.validUntil) : null,
            maxUses: promo.maxUses,
            isActive: promo.isActive,
            note: promo.note ?? "",
            productIds: [...promo.productIds],
        };
        this.dialogVisible = true;
    }

    save(): void {
        if (!this.formValid || this.saving) return;

        this.saving = true;

        const request: SaveShopPromoCodeRequest = {
            code: this.form.code.trim().toUpperCase(),
            discountType: this.form.discountType,
            discountValue: this.form.discountValue!,
            validFrom: this.form.validFrom?.toISOString() ?? null,
            validUntil: this.form.validUntil?.toISOString() ?? null,
            maxUses: this.form.maxUses || null,
            isActive: this.form.isActive,
            note: this.form.note.trim() || null,
            productIds: this.form.productIds,
        };

        const save$: Observable<ShopPromoCode> = this.editing
            ? this.shopService.updatePromoCode(this.editing.id, request)
            : this.shopService.createPromoCode(request);

        save$.subscribe({
            next: () => {
                this.saving = false;
                this.dialogVisible = false;
                this.toast("success", this.translationService.t("shop.promoSaved"));
                this.load();
            },
            error: (error) => {
                this.saving = false;
                this.toast("error", getErrorMessage(error));
            },
        });
    }

    confirmDelete(promo: ShopPromoCode): void {
        this.confirmationService.confirm({
            message: this.translationService.t("shop.confirmDeletePromo"),
            header: this.translationService.t("common.confirmDeletionHeader") + " " + promo.code,
            closable: true,
            closeOnEscape: true,
            icon: "pi pi-exclamation-triangle",
            rejectButtonProps: { label: this.translationService.t("common.no"), severity: "secondary", outlined: true },
            acceptButtonProps: { label: this.translationService.t("common.yes"), severity: "danger" },
            accept: () => {
                this.shopService.deletePromoCode(promo.id).subscribe({
                    next: () => {
                        this.toast("success", this.translationService.t("shop.promoDeleted"));
                        this.load();
                    },
                    error: (error) => this.toast("error", getErrorMessage(error)),
                });
            },
        });
    }

    private load(): void {
        this.loading = true;

        forkJoin([this.shopService.getPromoCodes(), this.shopService.getProducts()]).subscribe({
            next: ([promoCodes, products]) => {
                this.promoCodes = promoCodes;
                this.products = products;
                this.loading = false;
            },
            error: () => (this.loading = false),
        });
    }

    private emptyForm(): PromoForm {
        return {
            code: "",
            discountType: "Percent",
            discountValue: null,
            validFrom: null,
            validUntil: null,
            maxUses: null,
            isActive: true,
            note: "",
            productIds: [],
        };
    }

    private toast(severity: "success" | "error", detail: string): void {
        this.messageService.add({
            severity,
            summary: this.translationService.t(severity === "success" ? "common.success" : "common.error"),
            detail,
        });
    }
}
