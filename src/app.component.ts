import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {Toast} from "primeng/toast";
import {ConfirmationService, MessageService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, Toast, ConfirmDialogModule],
    providers: [
        MessageService,
        ConfirmationService
    ],
    template: `
        <p-confirmdialog position="top-center" />
        <p-toast position="top-center" />
        <router-outlet></router-outlet>`
})
export class AppComponent {
}
