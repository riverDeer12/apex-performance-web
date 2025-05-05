import { Component } from '@angular/core';
import { PublicMenuComponent } from '../../layout/component/public-menu/public-menu.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: "app-landing",
  imports: [PublicMenuComponent, RouterOutlet],
  templateUrl: "./landing.component.html",
  styleUrl: "./landing.component.scss",
})
export class LandingComponent {}
