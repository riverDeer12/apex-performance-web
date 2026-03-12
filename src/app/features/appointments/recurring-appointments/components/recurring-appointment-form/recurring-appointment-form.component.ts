import { Component, Input, OnInit } from "@angular/core";
import { ActionType } from "../../../../../enums/action-type";
import { RedirectType } from "../../../../../enums/redirect-type";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Client } from "../../../../clients/models/client";
import { Coach } from "../../../../coaches/models/coach";
import { TimeSlot } from "../../../../time-slots/models/time-slot";
import { Roles } from "../../../../../constants/roles";
import { ValidationService } from "../../../../../shared/services/validation.service";
import { HelperService } from "../../../../../shared/services/helper.service";
import { ClientService } from "../../../../clients/services/client.service";
import { TimeSlotService } from "../../../../time-slots/services/time-slot.service";
import { CoachService } from "../../../../coaches/services/coach.service";
import { MessageService } from "primeng/api";
import { AuthenticationService } from "../../../../authentication/services/authentication.service";
import { RecurringAppointment } from "../../models/recurring-appointment";
import { RecurringAppointmentService } from "../../services/recurring-appointment.service";
import { Select } from "primeng/select";
import { Button } from "primeng/button";
import { CommonModule } from "@angular/common";
import { MultiSelect } from "primeng/multiselect";
import { AppointmentType } from "../../../appointment-types/models/appointment-type";
import { AppointmentTypeService } from "../../../appointment-types/services/appointment-type.service";

@Component({
  selector: "app-recurring-appointment-form",
  imports: [CommonModule, Select, Button, ReactiveFormsModule, MultiSelect],
  templateUrl: "./recurring-appointment-form.component.html",
  styleUrl: "./recurring-appointment-form.component.scss",
})
export class RecurringAppointmentFormComponent implements OnInit {
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

  appointmentTypes!: AppointmentType[];

  loadingData!: boolean;

  get userRoles(): typeof Roles {
    return Roles;
  }

  get actionTypes(): typeof ActionType {
    return ActionType;
  }

  constructor(
    public validationService: ValidationService,
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private clientService: ClientService,
    private timeSlotService: TimeSlotService,
    private appointmentTypeService: AppointmentTypeService,
    private coachService: CoachService,
    private recurringAppointmentService: RecurringAppointmentService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
  ) {
    this.userRole = this.authenticationService.getUserRole();
  }

  ngOnInit() {
    this.initForm();
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

    this.type == ActionType.Create
      ? this.createRecurringAppointment()
      : this.updateRecurringAppointment();
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
          this.clients = response;
        });
    }
  }

  private initForm = () =>
    this.type == ActionType.Create
      ? this.initCreateForm()
      : this.initUpdateForm();

  private initFormData() {
    this.getAppointmentTypes();

    this.getClients();

    switch (this.userRole) {
      case Roles.Administrator:
        this.getAllCoaches();
        break;
      case Roles.Coach:
        this.getCoachTimeSlots();
        break;
      default:
        break;
    }
  }

  private initCreateForm() {
    this.form = this.formBuilder.group({
      timeSlot: [null, [Validators.required]],
      clients: [null, [Validators.required]],
      coach: [null, [Validators.required]],
      type: [null, [Validators.required]],
    });

    if (this.userRole == Roles.Coach) {
      this.setCoach();
    } else {
      this.initFormData();
    }
  }

  private initUpdateForm() {
    this.form = this.formBuilder.group({
      timeSlot: [this.recurringAppointment.timeSlot.id, [Validators.required]],
      clients: [
        this.recurringAppointment.clients.map((x) => x.id),
        [Validators.required],
      ],
      coach: [this.recurringAppointment.coach.id, [Validators.required]],
      type: [this.recurringAppointment.type.id, [Validators.required]],
    });

    if (this.userRole == Roles.Coach) {
      this.setCoach();
    } else {
      this.initFormData();
    }
  }

  private createRecurringAppointment() {
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
            detail: error.error.errors.generalErrors[0] || "An unexpected error occurred.",
          });
        },
        complete: () => {
          this.loadingData = false;
        },
      });
  }

  private updateRecurringAppointment() {
    this.recurringAppointmentService
      .updateRecurringAppointment(this.recurringAppointment.id, this.form.value)
      .subscribe({
        next: (response: RecurringAppointment) => {
          this.recurringAppointment = Object.assign(
            new RecurringAppointment(),
            response,
          );

          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Recurring Appointment is updated successfully.",
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
            summary: "Error Updating Recurring Appointment",
            detail: error.error.errors.generalErrors[0] || "An unexpected error occurred.",
          });
        },
        complete: () => {
          this.loadingData = false;
        },
      });
  }

  private getClients(): void {
    this.clientService.getClients().subscribe((response: Client[]) => {
      this.clients = response;
    });
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

  private getAllCoaches() {
    this.coachService.getAllCoaches().subscribe((response: Coach[]) => {
      this.coaches = response;
    });
  }

  private getAppointmentTypes() {
    this.appointmentTypeService
      .getAppointmentTypes()
      .subscribe((response: AppointmentType[]) => {
        this.appointmentTypes = response.map((x: AppointmentType) =>
          Object.assign(new AppointmentType(), x),
        );
      });
  }
}
