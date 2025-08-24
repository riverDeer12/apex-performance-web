import { Component, Input, OnInit } from "@angular/core";
import { ActionType } from "../../../../enums/action-type";
import { RedirectType } from "../../../../enums/redirect-type";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Client } from "../../../clients/models/client";
import { Coach } from "../../../coaches/models/coach";
import { TimeSlot } from "../../../time-slots/models/time-slot";
import { Roles } from "../../../../constants/roles";
import { ValidationService } from "../../../../services/validation.service";
import { HelperService } from "../../../../services/helper.service";
import { ClientService } from "../../../clients/services/client.service";
import { TimeSlotService } from "../../../time-slots/services/time-slot.service";
import { CoachService } from "../../../coaches/services/coach.service";
import { MessageService } from "primeng/api";
import { AuthenticationService } from "../../../authentication/services/authentication.service";
import { RecurringAppointment } from "../../models/recurring-appointment";
import { RecurringAppointmentService } from "../../services/recurring-appointment.service";
import { Select } from "primeng/select";
import { Button } from "primeng/button";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-recurring-appointment-form",
  imports: [CommonModule, Select, Button, ReactiveFormsModule],
  templateUrl: "./recurring-appointment-form.component.html",
  styleUrl: "./recurring-appointment-form.component.scss",
})
export class RecurringAppointmentFormComponent  {
  @Input() type!: ActionType;
  @Input() recurringAppointment!: RecurringAppointment;
  @Input() redirectType!: RedirectType;
  @Input() dialogId!: string;
  @Input() returnUrl!: string;

  userRole!: string;

  form!: FormGroup;

  clients!: Client[];

  coaches!: Coach[];

  timeSlots!: TimeSlot[];

  loadingData = false;

  get userRoles(): typeof Roles {
    return Roles;
  }

  constructor(
    public validationService: ValidationService,
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private clientService: ClientService,
    private timeSlotService: TimeSlotService,
    private coachService: CoachService,
    private recurringAppointmentService: RecurringAppointmentService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
  ) {
    this.userRole = this.authenticationService.getUserRole();
    this.initCreateForm();
  }

  submit() {
    this.loadingData = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.messageService.add({
        severity: "warn",
        summary: "Incomplete or incorrect data",
        detail: "Check the entered data and try again.",
      });

      this.loadingData = false;

      return;
    }

    this.createAppointment();
  }

  getTimeSlots(): void {
    this.loadingData = true;

    if (this.form.controls["coach"].invalid) {
      this.messageService.add({
        severity: "warn",
        summary: "Incomplete or incorrect data",
        detail: "Please select coach before proceeding.",
      });

      this.loadingData = false;

      return;
    } else {

      this.getCoachTimeSlots();

      this.clientService
        .getClientsByCoachId(this.form.controls["coach"].value)
        .subscribe((response: Client[]) => {
          this.clients = response.map((x: Client) =>
            Object.assign(new Client(), x),
          );
        });
    }
  }

  private initFormData() {
    switch (this.userRole) {
      case Roles.Administrator:
        this.getAllClients();
        this.getAllCoaches();
        break;
      case Roles.Coach:
        this.getCoachClients();
        this.getCoachTimeSlots();
        break;
      default:
        break;
    }
  }

  private setCoach() {
    this.coachService.getCurrentCoachId().subscribe({
      next: (coachId) => {
        this.form.controls["coach"].setValue(coachId);
        this.initFormData();
      },
    });
  }

  private getCoachTimeSlots() {
    this.timeSlotService
      .getRecurringAvailableTimeSlots(this.form.controls["coach"].value)
      .subscribe((response: TimeSlot[]) => {
        this.timeSlots = response.map((x: TimeSlot) =>
          Object.assign(new TimeSlot(), x),
        );
      });
  }

  private initCreateForm() {
    this.form = this.formBuilder.group({
      timeSlot: [null, [Validators.required]],
      client: [null, [Validators.required]],
      coach: [null, [Validators.required]],
    });

    if(this.userRole == Roles.Coach){
      this.setCoach();
    } else {
      this.initFormData();
    }
  }

  private createAppointment() {
    this.recurringAppointmentService
      .createRecurringAppointment(this.form.value)
      .subscribe({
        next: (response: RecurringAppointment) => {
          this.recurringAppointment = Object.assign(
            new RecurringAppointment(),
            response,
          );

          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Recurring Appointment is created successfully.",
          });

          this.helperService.redirectUserAfterSubmit(
            this.redirectType,
            this.returnUrl,
            this.dialogId,
          );
        },
        error: (error) => {
          console.error("Error:", error);

          this.messageService.add({
            severity: "error",
            summary: "Error Creating Recurring Appointment",
            detail: error.message || "An unexpected error occurred.",
          });
        },
        complete: () => {
          this.loadingData = false;
        },
      });
  }

  private getCoachClients() {
    this.clientService.getCoachClients().subscribe((response: Client[]) => {
      this.clients = response.map((x: Client) =>
        Object.assign(new Client(), x),
      );
    });
  }

  private getAllClients() {
    this.clientService.getAllClients().subscribe((response: Client[]) => {
      this.clients = response.map((x: Client) =>
        Object.assign(new Client(), x),
      );
    });
  }

  private getAllCoaches() {
    this.coachService.getAllCoaches().subscribe((response: Coach[]) => {
      this.coaches = response.map((x: Coach) => Object.assign(new Coach(), x));
    });
  }
}
