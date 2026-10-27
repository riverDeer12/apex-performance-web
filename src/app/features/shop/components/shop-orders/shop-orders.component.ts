import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { Button } from "primeng/button";
import { Tag } from "primeng/tag";
import { Checkbox } from "primeng/checkbox";
import { Dialog } from "primeng/dialog";
import { ConfirmationService, MessageService } from "primeng/api";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { getErrorMessage } from "../../../../constants/error-codes";
import { ShopService } from "../../services/shop.service";
import { ShopOrder, ShopOrderStatus } from "../../models/shop";
import { formatPrice } from "../../utils/format-price";

type TagSeverity = "success" | "info" | "warn" | "danger" | "secondary" | "contrast";

/**
 * Orders of the webshop. Paid orders are sent to the customer's BoxNow
 * locker (the parcel and its label are made automatically) and marked
 * shipped here. Unpaid checkouts are hidden unless asked for.
 */
@Component({
    selector: "app-shop-orders",
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, Button, Tag, Checkbox, Dialog, TranslatePipe],
    templateUrl: "./shop-orders.component.html",
})
export class ShopOrdersComponent implements OnInit {
    orders: ShopOrder[] = [];
    loading = false;
    showUnpaid = false;

    selected: ShopOrder | null = null;
    detailsVisible = false;
    updating = false;

    formatPrice = formatPrice;

    private readonly severities: Record<ShopOrderStatus, TagSeverity> = {
        Pending: "secondary",
        Paid: "warn",
        Shipped: "success",
        Cancelled: "danger",
    };

    constructor(
        private shopService: ShopService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private translationService: TranslationService,
    ) {}

    ngOnInit(): void {
        this.load();
    }

    get visibleOrders(): ShopOrder[] {
        return this.showUnpaid ? this.orders : this.orders.filter((x) => x.status !== "Pending");
    }

    severity = (status: ShopOrderStatus) => this.severities[status];

    itemCount = (order: ShopOrder) => order.items.reduce((sum, x) => sum + x.quantity, 0);

    openDetails(order: ShopOrder): void {
        this.selected = order;
        this.detailsVisible = true;
    }

    setStatus(order: ShopOrder, status: ShopOrderStatus): void {
        const apply = () => {
            this.updating = true;

            this.shopService.setOrderStatus(order.id, status).subscribe({
                next: (updated) => {
                    this.orders = this.orders.map((x) => (x.id === updated.id ? updated : x));
                    if (this.selected?.id === updated.id) this.selected = updated;
                    this.updating = false;
                    this.messageService.add({
                        severity: "success",
                        summary: this.translationService.t("common.success"),
                        detail: this.translationService.t("shop.orderUpdated"),
                    });
                },
                error: (error) => {
                    this.updating = false;
                    this.messageService.add({
                        severity: "error",
                        summary: this.translationService.t("common.error"),
                        detail: getErrorMessage(error),
                    });
                },
            });
        };

        if (status !== "Cancelled") {
            apply();
            return;
        }

        this.confirmationService.confirm({
            message: this.translationService.t("shop.confirmCancel"),
            header: this.translationService.t("shop.cancelOrder") + " " + order.number,
            closable: true,
            closeOnEscape: true,
            icon: "pi pi-exclamation-triangle",
            rejectButtonProps: { label: this.translationService.t("common.no"), severity: "secondary", outlined: true },
            acceptButtonProps: { label: this.translationService.t("common.yes"), severity: "danger" },
            accept: apply,
        });
    }

    load(): void {
        this.loading = true;

        this.shopService.getOrders().subscribe({
            next: (orders) => {
                this.orders = orders;
                this.loading = false;
            },
            error: () => (this.loading = false),
        });
    }
}
