import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MenuItem} from 'primeng/api';
import {AppMenuitem} from './app.menuitem';
import {AuthenticationService} from "../../features/authentication/services/authentication.service";
import {Permissions} from "../../constants/permissions";

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    constructor(private authenticationService: AuthenticationService) {
    }

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/admin/dashboard']}]
            },
            {
                label: 'Administrators',
                visible: this.authenticationService
                    .checkPermission(Permissions.CanGetAdministrators),
                items: [{
                    label: 'List of Administrators',
                    icon: 'pi pi-fw pi-users',
                    routerLink: ['/admin/administrators']
                }]
            },
            {
                label: 'Categories',
                visible: this.authenticationService
                    .checkPermission(Permissions.CanGetCategories),
                items: [{label: 'List of Categories', icon: 'pi pi-fw pi-bookmark', routerLink: ['/admin/categories']}]
            },
            {
                label: 'Recipes',
                visible: this.authenticationService
                    .checkPermission(Permissions.CanGetRecipes),
                items: [{label: 'List of Recipes', icon: 'pi pi-fw pi-book', routerLink: ['/admin/recipes']}]
            },
            {
                label: 'Users',
                visible: this.authenticationService
                    .checkPermission(Permissions.CanGetUsers),
                items: [
                    {
                        label: 'List of Users', icon: 'pi pi-fw pi-users', routerLink: ['/admin/users']
                    },
                    {
                        label: 'List of Roles', icon: 'pi pi-fw pi-crown', routerLink: ['/admin/users/roles']
                    }
                ]
            }
        ];
    }
}
