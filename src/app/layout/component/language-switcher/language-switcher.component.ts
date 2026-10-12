import { Component, Input, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Menu } from "primeng/menu";
import { Button } from "primeng/button";
import { MenuItem } from "primeng/api";
import { TranslationService } from "../../../i18n/translation.service";

/**
 * Button with the current language code that opens
 * a menu with all languages of the application.
 */
@Component({
    selector: "app-language-switcher",
    standalone: true,
    imports: [CommonModule, Menu, Button],
    template: `
        <button *ngIf="variant === 'topbar'; else floatingButton" type="button" class="layout-topbar-action"
                (click)="menu.toggle($event)" [attr.aria-label]="currentName">
            {{ translationService.language().toUpperCase() }}
        </button>
        <ng-template #floatingButton>
            <p-button type="button" [rounded]="true" severity="secondary" (onClick)="menu.toggle($event)"
                      [label]="translationService.language().toUpperCase()" [ariaLabel]="currentName" />
        </ng-template>
        <p-menu #menu [model]="items" [popup]="true" appendTo="body" />
    `,
})
export class LanguageSwitcherComponent {
    @Input() variant: "topbar" | "floating" = "topbar";

    translationService = inject(TranslationService);

    // Built once, the checkmark follows the current language.
    items: MenuItem[] = this.translationService.languages.map((language) => ({
        label: language.name,
        icon: "pi pi-fw",
        id: language.code,
        command: () => this.select(language.code),
    }));

    constructor() {
        this.updateIcons();
    }

    get currentName(): string {
        return this.translationService.languages.find((x) => x.code === this.translationService.language())?.name ?? "";
    }

    private select(code: (typeof this.translationService.languages)[number]["code"]): void {
        this.translationService.setLanguage(code);
        this.updateIcons();
    }

    private updateIcons(): void {
        const current = this.translationService.language();
        this.items = this.items.map((item) => ({ ...item, icon: item.id === current ? "pi pi-fw pi-check" : "pi pi-fw" }));
    }
}
