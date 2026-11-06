import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SelectButton } from "primeng/selectbutton";
import { TranslatePipe } from "../../../../i18n/translate.pipe";
import { TranslationService } from "../../../../i18n/translation.service";
import { ShopService } from "../../services/shop.service";
import { ShopStats, ShopStatsProduct } from "../../models/shop";

export type ProductSort = "views" | "addedToCart" | "favoriteAdds" | "savedFavorites" | "waiting" | "soldPieces" | "conversion";
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

    // Table of products, sorted by the chosen column (kept as a field, not a getter).
    sortBy: ProductSort = "views";
    products: ShopStatsProduct[] = [];
    totalWaiting = 0;
    totalAddedToCart = 0;

    readonly columns: ProductSort[] = ["views", "addedToCart", "favoriteAdds", "savedFavorites", "waiting", "soldPieces", "conversion"];
    loading = false;

    formatPrice = formatPrice;

    constructor(private shopService: ShopService, translationService: TranslationService) {
        this.periods = [7, 30, 90].map((value) => ({
            value,
            label: value + " " + translationService.t("shop.daysShort"),
        }));
    }


    // Made once: a new array on every change detection makes the select button render without end.
    readonly periods: { value: number; label: string }[];

    // Tallest bar of the chart, so the others are drawn relative to it.
    get maxVisits(): number {
        return Math.max(1, ...(this.stats?.perDay ?? []).map((x) => x.visits));
    }

    // Paid orders per 100 views of product pages.
    get conversion(): number {
        return this.stats && this.stats.productViews > 0 ? (this.stats.orders / this.stats.productViews) * 100 : 0;
    }

    // Pieces sold per 100 views of the product's page.
    conversionOf(product: ShopStatsProduct): number | null {
        return product.views > 0 ? (product.soldPieces / product.views) * 100 : null;
    }

    valueOf(product: ShopStatsProduct, column: ProductSort): number {
        return column === "conversion" ? (this.conversionOf(product) ?? -1) : (product[column] ?? 0);
    }

    sort(column: ProductSort): void {
        this.sortBy = column;
        this.sortProducts();
    }

    variantName(item: { size: string | null; color: string | null }): string {
        return [item.size, item.color].filter(Boolean).join(" / ") || "–";
    }

    private sortProducts(): void {
        this.products = [...(this.stats?.products ?? [])]
            .sort((a, b) => this.valueOf(b, this.sortBy) - this.valueOf(a, this.sortBy) || b.views - a.views);
    }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading = true;

        this.shopService.getStats(this.days).subscribe({
            next: (stats) => {
                this.stats = stats;
                this.totalWaiting = (stats.waitingList ?? []).reduce((sum, x) => sum + x.waiting, 0);
                this.totalAddedToCart = stats.products.reduce((sum, x) => sum + (x.addedToCart ?? 0), 0);
                this.sortProducts();
                this.loading = false;
            },
            error: () => (this.loading = false),
        });
    }
}
