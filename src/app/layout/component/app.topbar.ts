import {Component} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {StyleClassModule} from 'primeng/styleclass';
import {AppConfigurator} from './app.configurator';
import {LayoutService} from '../service/layout.service';
import {AuthenticationService} from "../../features/authentication/services/authentication.service";
import {DialogFormComponent} from "../../components/dialog-form/dialog-form.component";
import {EntityType} from "../../enums/entity-type";
import {DialogService} from 'primeng/dynamicdialog';
import {ButtonLabel} from "primeng/button";

@Component({
    selector: 'app-topbar',
    standalone: true,
    providers: [DialogService],
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator],
    template: `
        <div class="layout-topbar">
            <div class="layout-topbar-logo-container">
                <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                    <i class="pi pi-bars"></i>
                </button>
                <a class="layout-topbar-logo" routerLink="/">
                    <img src="assets/images/logo_transparent.png" alt="menu-logo">
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
                        <app-configurator/>
                    </div>
                    <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                        <i class="mx-2"
                           [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme()}"></i>
                    </button>
                </div>

                <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next"
                        enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                <div class="layout-topbar-menu hidden lg:block">
                    <div class="layout-topbar-menu-content">
                        <span class="pt-2"><i class="pi pi-user mx-2"></i> <strong>{{ username }}</strong> </span>
                        <button (click)="changePassword()" type="button" class="layout-topbar-action">
                            <i class="pi pi-key mx-2"></i> Change Password
                        </button>
                        <button (click)="logOut()" type="button" class="layout-topbar-action">
                            <i class="pi pi-sign-out mx-2"></i> Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>`
})
export class AppTopbar {
    items!: MenuItem[];

    username!: string;

    constructor(public layoutService: LayoutService,
                private dialogService: DialogService,
                private authenticationService: AuthenticationService) {
        this.username = this.authenticationService.getLoggedUserUsername();
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig
            .update((state) => ({...state, darkTheme: !state.darkTheme}));
    }

    logOut = () =>
        this.authenticationService.logOut('/authentication/login');

    changePassword(): void {
        this.dialogService.open(DialogFormComponent, {
            header: "Set Your New Password",
            data: {
                contentType: EntityType.ResetUserPassword,
                dialogId: 'resetUserPasswordForm'
            },
        });
    }
}
