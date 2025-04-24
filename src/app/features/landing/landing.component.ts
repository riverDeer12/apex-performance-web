import { Component } from '@angular/core';
import { Menubar } from 'primeng/menubar';
import { Badge } from 'primeng/badge';
import { Avatar } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { NgClass } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: "app-landing",
  imports: [Menubar, Badge, Avatar, NgClass, Ripple, InputText],
  templateUrl: "./landing.component.html",
  styleUrl: "./landing.component.scss",
})
export class LandingComponent {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: "Home",
        icon: "pi pi-home",
      },
      {
        label: "Projects",
        icon: "pi pi-search",
        badge: "3",
        items: [
          {
            label: "Core",
            icon: "pi pi-bolt",
            shortcut: "⌘+S",
          },
          {
            label: "Blocks",
            icon: "pi pi-server",
            shortcut: "⌘+B",
          },
          {
            separator: true,
          },
          {
            label: "UI Kit",
            icon: "pi pi-pencil",
            shortcut: "⌘+U",
          },
        ],
      },
    ];
  }
}
