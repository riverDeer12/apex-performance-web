import { Component, effect } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { Menubar } from 'primeng/menubar';
import { AppConfigurator } from '../app.configurator';
import { TranslationService } from '../../../i18n/translation.service';

@Component({
  selector: "app-public-menu",
  imports: [
    Menubar,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    Ripple,
    CommonModule,
    AppConfigurator,
  ],
  templateUrl: "./public-menu.component.html",
  styleUrl: "./public-menu.component.scss",
})
export class PublicMenuComponent {
  items: MenuItem[] | undefined;

  constructor(private translationService: TranslationService) {
    effect(() => {
      this.translationService.language();
      this.buildMenu();
    });
  }

  ngOnInit() {
    this.buildMenu();
  }

  private buildMenu() {
    const t = (key: string) => this.translationService.t(key);

    this.items = [
      {
        label: t("publicMenu.home"),
      },
      {
        label: t("publicMenu.about"),
      },
      {
        label: t("publicMenu.shop"),
      },
      {
        label: t("publicMenu.contact"),
      },
    ];
  }
}
