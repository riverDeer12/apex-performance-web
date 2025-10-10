import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { AuthenticationService } from "../../services/authentication.service";
import { AppFloatingConfigurator } from "../../../../layout/component/app.floatingconfigurator";
import { ValidationService } from "../../../../shared/services/validation.service";
import { ResetPasswordFormComponent } from "../reset-password-form/reset-password-form.component";
import { RedirectType } from "../../../../enums/redirect-type";

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [
    AppFloatingConfigurator,
    ReactiveFormsModule,
    ResetPasswordFormComponent,
  ],
  providers: [MessageService],
  templateUrl: "./reset-password.component.html",
  styleUrl: "./reset-password.component.scss",
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;

  loadingData!: boolean;

  get redirectTypes(): typeof RedirectType {
    return RedirectType;
  }

  constructor(
    public validationService: ValidationService,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const token = params["token"];

      if (token && this.authenticationService.validateToken(token)) {
        localStorage.setItem("token", token);
      } else {
        this.router.navigateByUrl("/authentication/login").then();
      }
    });
  }
}
