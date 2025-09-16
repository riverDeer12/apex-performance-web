import { Component, OnInit } from "@angular/core";
import { MenuItem } from "primeng/api";
import { BadgeModule } from "primeng/badge";
import { AvatarModule } from "primeng/avatar";
import { InputTextModule } from "primeng/inputtext";
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Ripple } from "primeng/ripple";
import { Menubar } from "primeng/menubar";
import { AppConfigurator } from "../app.configurator";
import { LayoutService } from "../../service/layout.service";

@Component({
  selector: "app-public-menu",
  imports: [
    CommonModule,
    Menubar,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    Ripple,
    CommonModule,
    AppConfigurator,
    NgOptimizedImage,
  ],
  templateUrl: "./public-menu.component.html",
  styleUrl: "./public-menu.component.scss",
})
export class PublicMenuComponent implements OnInit {
  items: MenuItem[] | undefined;

  constructor(public layoutService: LayoutService) {}

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
        routerLink: ["/shop"],
      },
      {
        label: "Contact",
      },
    ];
  }
}
