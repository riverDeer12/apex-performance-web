import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { Menubar } from 'primeng/menubar';
import { AppConfigurator } from '../app.configurator';

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

  ngOnInit() {
    this.items = [
      {
        label: "Home",
      },
      {
        label: "About",
      },
      {
        label: "Shop",
      },
      {
        label: "Contact",
      },
    ];
  }
}
