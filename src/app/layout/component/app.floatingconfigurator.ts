import {Component, computed, inject} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {StyleClassModule} from 'primeng/styleclass';
import {AppConfigurator} from './app.configurator';
import {LayoutService} from '../service/layout.service';
import {TranslationService} from '../../i18n/translation.service';

@Component({
    selector: 'app-floating-configurator',
    standalone: true,
    imports: [ButtonModule, StyleClassModule, AppConfigurator],
    template: `
        <div class="fixed flex gap-4 top-8 right-8">
            <div class="relative" style="visibility: hidden">
                <p-button icon="pi pi-palette" pStyleClass="@next" enterFromClass="hidden"
                          enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout"
                          [hideOnOutsideClick]="true" type="button" rounded />
                <app-configurator />
            </div>
            <p-button type="button" (onClick)="toggleLanguage()" [rounded]="true"
                      [label]="translationService.language().toUpperCase()" severity="secondary" />
            <p-button type="button" (onClick)="toggleDarkMode()" [rounded]="true"
                      [icon]="isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'" severity="secondary" />
        </div>
    `
})
export class AppFloatingConfigurator {
    LayoutService = inject(LayoutService);

    translationService = inject(TranslationService);

    isDarkTheme = computed(() => this.LayoutService.layoutConfig().darkTheme);

    toggleDarkMode() {
        localStorage.setItem("theme", "dark");
        this.LayoutService.layoutConfig.update((state) => ({...state, darkTheme: !state.darkTheme}));
    }

    toggleLanguage() {
        this.translationService.toggleLanguage();
    }
}
