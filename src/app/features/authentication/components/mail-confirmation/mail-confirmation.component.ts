import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../../services/authentication.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Button } from "primeng/button";
import { ReactiveFormsModule } from "@angular/forms";
import { AppConfigurator } from "../../../../layout/component/app.configurator";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-mail-confirmation",
  imports: [Button, ReactiveFormsModule, AppConfigurator],
  providers: [MessageService],
  templateUrl: "./mail-confirmation.component.html",
  styleUrl: "./mail-confirmation.component.scss",
})
export class MailConfirmationComponent implements OnInit {
  constructor(
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const token = params["token"];

      if (token && this.authenticationService.validateToken(token)) {
        localStorage.setItem("token", token);

        this.authenticationService.notifyMailConfirmation().subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Your email has been confirmed!",
            });
          },
        });
      } else {
        this.router.navigateByUrl("/authentication/login").then();
      }
    });
  }

  login(): void {
    this.router.navigateByUrl("admin/dashboard").then();
  }
}
