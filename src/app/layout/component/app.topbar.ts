import { Component } from "@angular/core";
import { MenuItem, MessageService } from "primeng/api";
import { RouterModule } from "@angular/router";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { StyleClassModule } from "primeng/styleclass";
import { AppConfigurator } from "./app.configurator";
import { LayoutService } from "../service/layout.service";
import { AuthenticationService } from "../../features/authentication/services/authentication.service";
import { DialogFormComponent } from "../../shared/components/dialog-form/dialog-form.component";
import { EntityType } from "../../enums/entity-type";
import { DialogService } from "primeng/dynamicdialog";
import { ButtonLabel } from "primeng/button";

@Component({
  selector: "app-topbar",
  standalone: true,
  providers: [DialogService, MessageService],
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    AppConfigurator,
    NgOptimizedImage,
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
              ? 'assets/images/logo_light_theme.png'
              : 'assets/images/logo_dark_theme.png'
          "
          width="200"
          height="50"
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
          <button
            (click)="changeUsername()"
            type="button"
            class="layout-topbar-action"
          >
            <i class="pi pi-user-edit mx-2"></i> Change Username
          </button>
          <button
            (click)="changePassword()"
            type="button"
            class="layout-topbar-action"
          >
            <i class="pi pi-key mx-2"></i> Change Password
          </button>
          <span class="pt-2"
            ><i class="pi pi-user mx-2"></i> <strong>{{ username }}</strong>
          </span>
          <button (click)="logOut()" type="button" class="layout-topbar-action">
            <i class="pi pi-sign-out mx-2"></i> Log Out
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
    private dialogService: DialogService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
  ) {
    this.username = this.authenticationService.getLoggedUserUsername();
  }

  toggleDarkMode() {

    localStorage.setItem("theme", "dark");

    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }

  logOut = () =>
      this.authenticationService.logOut("/authentication/login");

  changePassword(): void {
    this.dialogService.open(DialogFormComponent, {
      header: "Set Your New Password",
      data: {
        contentType: EntityType.ResetUserPassword,
        dialogId: "resetUserPasswordForm",
      },
    });
  }

  changeUsername(): void {
    const changeUsernameDialogRef = this.dialogService.open(
      DialogFormComponent,
      {
        header: "Set Your New Username",
        data: {
          contentType: EntityType.ChangeUsername,
          dialogId: "resetUsernameForm",
        },
      },
    );

    changeUsernameDialogRef.onClose.subscribe((response: any) => {
      this.messageService.add({
        severity: "success",
        summary: "Success",
        detail:
          "Username changed successfully. On next login you can use your new username.",
      });

      this.username = this.authenticationService.getLoggedUserUsername();
    });
  }
}
