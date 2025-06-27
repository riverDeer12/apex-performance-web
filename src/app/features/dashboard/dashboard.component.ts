import {Component, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DialogService} from "primeng/dynamicdialog";
import {AuthenticationService} from "../authentication/services/authentication.service";

@Component({
    selector: "app-dashboard",
    standalone: true,
    imports: [CommonModule],
    providers: [DialogService],
    templateUrl: "./dashboard.component.html",
    styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
    isAdmin!: boolean;

    constructor(
        private authenticationService: AuthenticationService,
    ) {
        this.isAdmin = this.authenticationService.validateUserRole();
    }

    ngOnInit() {
    }

}
