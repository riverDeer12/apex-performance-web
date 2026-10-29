import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { InputNumber } from "primeng/inputnumber";
import { MessageService } from "primeng/api";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { getErrorMessage } from "../../../../constants/error-codes";
import { ShopService } from "../../services/shop.service";
import { ShopAdminSettings } from "../../models/shop";
import { formatPrice } from "../../utils/format-price";

/**
 * Settings of the webshop: delivery price and free delivery, the discount
 * for clients of the studio logged in to the shop, and the email that gets
 * new orders. Empty values use the server's defaults, shown as placeholders.
 */
@Component({
    selector: "app-shop-settings",
    standalone: true,
    imports: [CommonModule, FormsModule, Button, InputText, InputNumber, TranslatePipe],
    templateUrl: "./shop-settings.component.html",
})
export class ShopSettingsComponent implements OnInit {
    settings: ShopAdminSettings | null = null;
    shippingPrice: number | null = null;
    freeShippingFrom: number | null = null;
    clientDiscountPercent: number | null = 0;
    notificationEmail = "";
    saving = false;

    formatPrice = formatPrice;

    constructor(
        private shopService: ShopService,
        private messageService: MessageService,
        private translationService: TranslationService,
    ) {}

    ngOnInit(): void {
        this.shopService.getSettings().subscribe((settings) => this.apply(settings));
    }

    get valid(): boolean {
        const email = this.notificationEmail.trim();
        return (this.clientDiscountPercent ?? 0) >= 0 && (this.clientDiscountPercent ?? 0) <= 90 &&
            (!email || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));
    }

    save(): void {
        if (!this.valid || this.saving) return;

        this.saving = true;

        this.shopService.saveSettings({
            shippingPrice: this.shippingPrice,
            freeShippingFrom: this.freeShippingFrom,
            clientDiscountPercent: this.clientDiscountPercent ?? 0,
            notificationEmail: this.notificationEmail.trim() || null,
        }).subscribe({
            next: (settings) => {
                this.apply(settings);
                this.saving = false;
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t("shop.settingsSaved"),
                });
            },
            error: (error) => {
                this.saving = false;
                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("common.error"),
                    detail: getErrorMessage(error),
                });
            },
        });
    }

    private apply(settings: ShopAdminSettings): void {
        this.settings = settings;
        this.shippingPrice = settings.shippingPrice;
        this.freeShippingFrom = settings.freeShippingFrom;
        this.clientDiscountPercent = settings.clientDiscountPercent;
        this.notificationEmail = settings.notificationEmail ?? "";
    }
}
