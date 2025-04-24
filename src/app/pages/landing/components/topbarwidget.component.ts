import { Component } from "@angular/core";
import { StyleClassModule } from "primeng/styleclass";
import { Router, RouterModule } from "@angular/router";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import { AppConfigurator } from "../../../layout/component/app.configurator";

@Component({
  selector: "topbar-widget",
  imports: [
    RouterModule,
    StyleClassModule,
    ButtonModule,
    RippleModule,
    AppConfigurator,
  ],
  template: `<a class="flex items-center" href="#">
      <span
        class="text-surface-900 dark:text-surface-0 font-medium text-2xl leading-normal mr-20"
      >
        <img
          style="width: 8rem"
          src="assets/images/logo_transparent.png"
          alt="menu-logo"
        />
      </span>
    </a>

    <a
      pButton
      [text]="true"
      severity="secondary"
      [rounded]="true"
      pRipple
      class="lg:!hidden"
      pStyleClass="@next"
      enterClass="hidden"
      leaveToClass="hidden"
      [hideOnOutsideClick]="true"
    >
      <i class="pi pi-bars !text-2xl"></i>
    </a>

    <div
      class="items-center bg-surface-0 dark:bg-surface-900 grow justify-between hidden lg:flex absolute lg:static w-full left-0 top-full px-12 lg:px-0 z-20 rounded-border"
    >
      <ul
        class="list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-8"
      >
        <li>
          <a
            (click)="router.navigate([''])"
            pRipple
            class="px-0 py-4 text-surface-900 dark:text-surface-0 font-medium text-xl"
          >
            <span>Test</span>
          </a>
        </li>
      </ul>
      <div
        class="flex border-t lg:border-t-0 border-surface py-4 lg:py-0 mt-4 lg:mt-0 gap-2"
      >
        <app-configurator />
      </div>
    </div> `,
})
export class TopbarWidget {
  constructor(public router: Router) {}
}
