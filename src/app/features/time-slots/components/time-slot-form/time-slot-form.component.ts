import { Component, Input } from "@angular/core";
import { Button } from "primeng/button";
import { NgIf } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActionType } from "../../../../enums/action-type";
import { RedirectType } from "../../../../enums/redirect-type";
import { ValidationService } from "../../../../shared/services/validation.service";
import { HelperService } from "../../../../shared/services/helper.service";
import { MessageService } from "primeng/api";
import { TimeSlot } from "../../models/time-slot";
import { TimeSlotService } from "../../services/time-slot.service";
import { AuthenticationService } from "../../../authentication/services/authentication.service";
import { Select } from "primeng/select";
import { DatePicker } from "primeng/datepicker";
import { DateExtensions } from "../../../../shared/extensions/date-extensions";
import { Roles } from "../../../../constants/roles";
import { Coach } from "../../../coaches/models/coach";
import { CoachService } from "../../../coaches/services/coach.service";
import { DayOfWeek } from "../../../../enums/day-of-week";

@Component({
  selector: "app-time-slot-form",
  imports: [Button, NgIf, ReactiveFormsModule, Select, DatePicker],
  templateUrl: "./time-slot-form.component.html",
  styleUrl: "./time-slot-form.component.scss",
})
export class TimeSlotFormComponent {
  @Input() type!: ActionType;
  @Input() timeSlot!: TimeSlot;
  @Input() redirectType!: RedirectType;
  @Input() dialogId!: string;
  @Input() returnUrl!: string;

  form!: FormGroup;

  loadingData!: boolean;

  userRole!: string;

  coaches!: Coach[];

  weekDays = DateExtensions.getWeekDays(DayOfWeek.Monday);

  get userRoles(): typeof Roles {
    return Roles;
  }

  constructor(
    public validationService: ValidationService,
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private timeSlotService: TimeSlotService,
    private coachService: CoachService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
  ) {
    this.userRole = this.authenticationService.getUserRole();
  }

  ngOnInit(): void {
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
      ? this.createTimeSlot()
      : this.updateTimeSlot();
  }

  private initForm = () =>
    this.type == ActionType.Create
      ? this.initCreateForm()
      : this.initUpdateForm();

  private initCreateForm() {
    this.form = this.formBuilder.group({
      coach: ["", [Validators.required]],
      day: ["", [Validators.required]],
      startTime: ["", [Validators.required]],
      endTime: ["", [Validators.required]],
    });

    if (this.userRole == Roles.Coach) {
      this.setCoach();
    } else {
      this.getAllCoaches();
    }
  }

  private initUpdateForm() {
    this.form = this.formBuilder.group({
      coach: [this.timeSlot.coach.id, [Validators.required]],
      day: [this.timeSlot.day, [Validators.required]],
      startTime: [new Date(this.timeSlot.startTime), [Validators.required]],
      endTime: [new Date(this.timeSlot.endTime), [Validators.required]],
    });
  }

  private createTimeSlot() {
    this.timeSlotService.createTimeSlot(this.form.value).subscribe({
      next: (response: TimeSlot) => {
        this.timeSlot = Object.assign(new TimeSlot(), response);

        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "TimeSlot is created successfully.",
        });

        this.helperService.redirectUserAfterSubmit(
          this.redirectType,
          this.returnUrl,
          this.dialogId,
        );
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Error Creating TimeSlot",
          detail: error.error.errors.generalErrors[0] || "An unexpected error occurred.",
        });
      },
      complete: () => {
        this.loadingData = false;
      },
    });
  }

  private updateTimeSlot() {
    this.timeSlotService
      .updateTimeSlot(this.timeSlot.id, this.form.value)
      .subscribe({
        next: (response: TimeSlot) => {
          this.timeSlot = Object.assign(new TimeSlot(), response);

          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "TimeSlot is updated successfully.",
          });

          this.helperService.redirectUserAfterSubmit(
            this.redirectType,
            this.returnUrl,
            this.dialogId,
          );
        },
        error: (error) => {
          this.messageService.add({
            severity: "error",
            summary: "Error Updating TimeSlot",
            detail: error.error.errors.generalErrors[0] || "An unexpected error occurred.",
          });
        },
        complete: () => {
          this.loadingData = false;
        },
      });
  }

  private getAllCoaches() {
    this.coachService.getAllCoaches().subscribe((response: Coach[]) => {
      this.coaches = response.map((x: Coach) => Object.assign(new Coach(), x));
    });
  }

  private setCoach() {
    this.coachService.getCurrentCoachId().subscribe({
      next: (coachId) => {
        this.form.controls["coach"].setValue(coachId);
      },
    });
  }
}
