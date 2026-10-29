import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SelectButton } from "primeng/selectbutton";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { ShopService } from "../../services/shop.service";
import { ShopStats } from "../../models/shop";
import { formatPrice } from "../../utils/format-price";

/**
 * Visits and sales of the webshop. Visits are page views counted per day
 * without cookies or anything about the visitor.
 */
@Component({
    selector: "app-shop-stats",
    standalone: true,
    imports: [CommonModule, FormsModule, SelectButton, TranslatePipe],
    templateUrl: "./shop-stats.component.html",
})
export class ShopStatsComponent implements OnInit {
    stats: ShopStats | null = null;
    days = 30;
    loading = false;

    formatPrice = formatPrice;

    constructor(private shopService: ShopService, private translationService: TranslationService) {}

    get periods() {
        return [7, 30, 90].map((value) => ({
            value,
            label: value + " " + this.translationService.t("shop.daysShort"),
        }));
    }

    // Tallest bar of the chart, so the others are drawn relative to it.
    get maxVisits(): number {
        return Math.max(1, ...(this.stats?.perDay ?? []).map((x) => x.visits));
    }

    // Paid orders per 100 views of product pages.
    get conversion(): number {
        return this.stats && this.stats.productViews > 0 ? (this.stats.orders / this.stats.productViews) * 100 : 0;
    }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading = true;

        this.shopService.getStats(this.days).subscribe({
            next: (stats) => {
                this.stats = stats;
                this.loading = false;
            },
            error: () => (this.loading = false),
        });
    }
}
