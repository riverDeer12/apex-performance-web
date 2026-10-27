import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { InputNumber } from "primeng/inputnumber";
import { Select } from "primeng/select";
import { Checkbox } from "primeng/checkbox";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { Dialog } from "primeng/dialog";
import { MessageService } from "primeng/api";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { getErrorMessage } from "../../../../constants/error-codes";
import { ShopService } from "../../services/shop.service";
import { ShopStockMovement, ShopStockReason, ShopStockRow } from "../../models/shop";
import { formatPrice } from "../../utils/format-price";

// At most this many pieces left counts as low stock.
const LowStock = 3;

/**
 * Warehouse of the webshop: stock of every size and color, goods received,
 * written off or counted, and the history of each variant. Sales and
 * returns of orders are recorded automatically.
 */
@Component({
    selector: "app-shop-stock",
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, Button, InputText, InputNumber, Select, Checkbox, IconField,
        InputIcon, Dialog, TranslatePipe],
    templateUrl: "./shop-stock.component.html",
})
export class ShopStockComponent implements OnInit {
    rows: ShopStockRow[] = [];
    loading = false;
    onlyLow = false;

    adjusting: ShopStockRow | null = null;
    adjustVisible = false;
    reason: ShopStockReason = "Receipt";
    quantity: number | null = null;
    note = "";
    saving = false;

    history: ShopStockRow | null = null;
    historyVisible = false;
    movements: ShopStockMovement[] = [];
    historyLoading = false;

    formatPrice = formatPrice;
    readonly lowStock = LowStock;

    constructor(
        public shopService: ShopService,
        private messageService: MessageService,
        private translationService: TranslationService,
    ) {}

    get visibleRows(): ShopStockRow[] {
        return this.onlyLow ? this.rows.filter((x) => x.stock <= LowStock) : this.rows;
    }

    get totalPieces(): number {
        return this.rows.reduce((sum, x) => sum + x.stock, 0);
    }

    // Stock at sale prices.
    get totalValue(): number {
        return this.rows.reduce((sum, x) => sum + x.stock * x.price, 0);
    }

    get lowCount(): number {
        return this.rows.filter((x) => x.stock <= LowStock).length;
    }

    get reasons() {
        return ["Receipt", "WriteOff", "Correction"].map((value) => ({
            value,
            label: this.translationService.t("shop.reason" + value),
        }));
    }

    // Stock after the change, shown before saving.
    get newStock(): number | null {
        if (!this.adjusting || this.quantity === null) return null;

        switch (this.reason) {
            case "Receipt": return this.adjusting.stock + this.quantity;
            case "WriteOff": return this.adjusting.stock - this.quantity;
            default: return this.quantity;
        }
    }

    get adjustValid(): boolean {
        return this.quantity !== null && (this.reason === "Correction" || this.quantity > 0) &&
            (this.newStock ?? -1) >= 0 && this.newStock !== this.adjusting?.stock;
    }

    ngOnInit(): void {
        this.load();
    }

    variantName = (row: ShopStockRow) => [row.size, row.color].filter(Boolean).join(" / ");

    openAdjust(row: ShopStockRow, reason: ShopStockReason = "Receipt"): void {
        this.adjusting = row;
        this.reason = reason;
        this.quantity = null;
        this.note = "";
        this.adjustVisible = true;
    }

    saveAdjust(): void {
        if (!this.adjusting || !this.adjustValid || this.saving) return;

        this.saving = true;

        this.shopService.adjustStock(this.adjusting.variantId, this.reason, this.quantity!, this.note.trim() || null)
            .subscribe({
                next: (row) => {
                    this.rows = this.rows.map((x) => (x.variantId === row.variantId ? row : x));
                    this.saving = false;
                    this.adjustVisible = false;
                    this.messageService.add({
                        severity: "success",
                        summary: this.translationService.t("common.success"),
                        detail: this.translationService.t("shop.stockSaved"),
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

    openHistory(row: ShopStockRow): void {
        this.history = row;
        this.movements = [];
        this.historyVisible = true;
        this.historyLoading = true;

        this.shopService.getStockMovements(row.variantId).subscribe({
            next: (movements) => {
                this.movements = movements;
                this.historyLoading = false;
            },
            error: () => (this.historyLoading = false),
        });
    }

    load(): void {
        this.loading = true;

        this.shopService.getStock().subscribe({
            next: (rows) => {
                this.rows = rows;
                this.loading = false;
            },
            error: () => (this.loading = false),
        });
    }
}
