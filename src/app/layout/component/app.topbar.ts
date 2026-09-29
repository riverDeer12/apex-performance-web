import { Component } from "@angular/core";
import { MenuItem } from "primeng/api";
import { RouterModule } from "@angular/router";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { StyleClassModule } from "primeng/styleclass";
import { AppConfigurator } from "./app.configurator";
import { LayoutService } from "../service/layout.service";
import { AuthenticationService } from "../../features/authentication/services/authentication.service";
import { ProfileService } from "../../features/profile/services/profile.service";
import { ButtonLabel } from "primeng/button";
import { TranslationService } from "../../i18n/translation.service";
import { TranslatePipe } from "../../i18n/translate.pipe";

@Component({
  selector: "app-topbar",
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    AppConfigurator,
    NgOptimizedImage,
    TranslatePipe,
  ],
  template: ` <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button
        class="layout-menu-button layout-topbar-action"
        (click)="layoutService.onMenuToggle()"
      >
        <i class="pi pi-bars"></i>
      </button>
      <a class="layout-topbar-logo" routerLink="/">
        <img
          [ngSrc]="
            !layoutService.isDarkTheme()
              ? 'assets/images/logo_light.svg'
              : 'assets/images/logo_dark.svg'
          "
          width="602"
          height="262"
          alt="menu-logo"
        />
      </a>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <div class="relative" style="visibility: hidden">
          <button
            class="layout-topbar-action layout-topbar-action-highlight"
            pStyleClass="@next"
            enterFromClass="hidden"
            enterActiveClass="animate-scalein"
            leaveToClass="hidden"
            leaveActiveClass="animate-fadeout"
            [hideOnOutsideClick]="true"
          >
            <i class="pi pi-palette"></i>
          </button>
          <app-configurator />
        </div>
        <button
          type="button"
          class="layout-topbar-action"
          (click)="toggleLanguage()"
        >
          {{ translationService.language().toUpperCase() }}
        </button>
        <button
          type="button"
          class="layout-topbar-action"
          (click)="toggleDarkMode()"
        >
          <i
            class="mx-2"
            [ngClass]="{
              'pi ': true,
              'pi-moon': layoutService.isDarkTheme(),
              'pi-sun': !layoutService.isDarkTheme(),
            }"
          ></i>
        </button>
      </div>

      <button
        class="layout-topbar-menu-button layout-topbar-action"
        pStyleClass="@next"
        enterFromClass="hidden"
        enterActiveClass="animate-scalein"
        leaveToClass="hidden"
        leaveActiveClass="animate-fadeout"
        [hideOnOutsideClick]="true"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <a
            routerLink="/admin/profile"
            class="layout-topbar-action topbar-profile-link"
            [attr.aria-label]="'topbar.profile' | translate"
          >
            <img
              *ngIf="profileService.pictureUrl() as pictureUrl; else noPicture"
              class="topbar-avatar"
              [src]="pictureUrl"
              alt=""
            />
            <ng-template #noPicture>
              <i class="pi pi-user mx-2"></i>
            </ng-template>
            <strong>{{ profileService.profile()?.username ?? username }}</strong>
          </a>
          <button (click)="logOut()" type="button" class="layout-topbar-action">
            <i class="pi pi-sign-out mx-2"></i> {{ "topbar.logOut" | translate }}
          </button>
        </div>
      </div>
    </div>
  </div>`,
})
export class AppTopbar {
  items!: MenuItem[];

  username!: string;

  constructor(
    public layoutService: LayoutService,
    public translationService: TranslationService,
    private authenticationService: AuthenticationService,
    public profileService: ProfileService,
  ) {
    this.username = this.authenticationService.getLoggedUserUsername();
    this.profileService.load();
  }

  toggleLanguage() {
    this.translationService.toggleLanguage();
  }

  toggleDarkMode() {

    localStorage.setItem("theme", "dark");

    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }

  logOut(): void {
    this.profileService.clear();
    this.authenticationService.logOut("/authentication/login");
  }
}
