import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { DialogService } from "primeng/dynamicdialog";
import { ConfirmationService, MessageService } from "primeng/api";
import { HelperService } from "../../shared/services/helper.service";
import { Table, TableModule } from "primeng/table";
import { DialogFormComponent } from "../../shared/components/dialog-form/dialog-form.component";
import { EntityType } from "../../enums/entity-type";
import { ActionType } from "../../enums/action-type";
import { TimeSlot } from "./models/time-slot";
import { TimeSlotService } from "./services/time-slot.service";
import { Button, ButtonDirective } from "primeng/button";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { CommonModule } from "@angular/common";
import { Roles } from '../../constants/roles';
import { AuthenticationService } from "../authentication/services/authentication.service";
import { CoachService } from "../coaches/services/coach.service";
import { TranslationService } from "../../i18n/translation.service";
import { TranslatePipe } from "../../i18n/translate.pipe";

@Component({
  selector: "app-time-slots",
  imports: [
    CommonModule,
    Button,
    ButtonDirective,
    IconField,
    InputIcon,
    InputText,
    TableModule,
    TranslatePipe,
  ],
  providers: [DialogService],
  templateUrl: "./time-slots.component.html",
  styleUrl: "./time-slots.component.scss",
})
export class TimeSlotsComponent implements OnInit {
  @Input() timeSlots!: TimeSlot[];

  @ViewChild(`filter`) filter!: ElementRef;

  userRole!: string;

  coachId!: string;

  constructor(
    private timeSlotService: TimeSlotService,
    private authenticationService: AuthenticationService,
    private dialogService: DialogService,
    private coachService: CoachService,
    private messageService: MessageService,
    private helperService: HelperService,
    private confirmationService: ConfirmationService,
    private translationService: TranslationService,
  ) {
    this.userRole = this.authenticationService.getUserRole();
  }

  ngOnInit(): void {
    this.loadData();
    this.getDataStatus();
  }

  private loadData(): void {
    if (this.userRole == Roles.Administrator) {
      this.loadAdminTimeSlots();
    } else if (this.userRole == Roles.Coach) {
      this.loadCoachTimeSlots();
      this.setCoach();
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = "";
  }

  openCreateDialog() {
    const dialogRef = this.dialogService.open(DialogFormComponent, {
      header: this.translationService.t("timeSlots.addNew"),
      data: {
        contentType: EntityType.TimeSlot,
        formType: ActionType.Create,
        dialogId: "createTimeSlotForm",
      },
    });

    dialogRef.onClose.subscribe((response: any) => {
      this.loadData();
    });
  }

  changeActivity(timeSlot: TimeSlot) {
    this.confirmationService.confirm({
      message: this.translationService.t("timeSlots.confirmActivityChange"),
      header: this.translationService.t("timeSlots.confirmActivityChangeHeader") + " " + timeSlot.startTime + '-' + timeSlot.endTime,
      closable: true,
      closeOnEscape: true,
      icon: "pi pi-exclamation-triangle",
      rejectButtonProps: {
        label: this.translationService.t("common.no"),
        severity: "secondary",
        outlined: true,
      },
      acceptButtonProps: {
        label: this.translationService.t("common.yes"),
      },
      accept: () => {
        this.timeSlotService.changeCoachTimeSlotActivity(timeSlot.id, this.coachId).subscribe(
          () => {
            this.messageService.add({
              severity: "success",
              summary: this.translationService.t("common.success"),
              detail: this.translationService.t("timeSlots.activityChangedDetail"),
            });

            this.loadData();

          },
          () => {
            this.messageService.add({
              severity: "error",
              summary: this.translationService.t("common.error"),
              detail: this.translationService.t("timeSlots.activityChangeErrorDetail"),
            });
          },
        );
      },
    });
  }

  private setCoach() {
    this.coachService.getCurrentCoachId().subscribe({
      next: coachId => {
        this.coachId = coachId;
      }
    })
  }

  private loadAdminTimeSlots() {
    // Note: GET /time-slots/all does not return a `status` field (unlike the
    // coach-scoped endpoint below), so active/inactive filtering can't be
    // applied here without a backend change.
    this.timeSlotService.getAllTimeSlots().subscribe((response: TimeSlot[]) => {
      this.timeSlots = response.map((x: TimeSlot) =>
        Object.assign(new TimeSlot(), x),
      );
    });
  }

  private loadCoachTimeSlots(): void {
    this.timeSlotService.getCoachTimeSlots().subscribe({
      next: (data: TimeSlot[]) => {
        this.timeSlots = data
          .filter((x: TimeSlot) => x.status)
          .map((x: TimeSlot) => Object.assign(new TimeSlot(), x));
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  private getDataStatus() {
    this.helperService.getDataStatus().subscribe((response: boolean) => {
      if (response) {
        this.loadData();
      }
    });
  }
}
