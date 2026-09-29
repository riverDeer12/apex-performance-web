import {Component, Input, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {InputText} from "primeng/inputtext";
import {Button} from "primeng/button";
import {MessageService} from "primeng/api";
import {ActionType} from "../../../../../enums/action-type";
import {RedirectType} from "../../../../../enums/redirect-type";
import {ValidationService} from "../../../../../shared/services/validation.service";
import {HelperService} from "../../../../../shared/services/helper.service";
import {getErrorMessage} from "../../../../../constants/error-codes";
import {TranslationService} from "../../../../../i18n/translation.service";
import {TranslatePipe} from "../../../../../i18n/translate.pipe";
import {AppointmentLocation, AppointmentLocationRequest} from "../../models/appointment-location";
import {AppointmentLocationService} from "../../services/appointment-location.service";

@Component({
    selector: "app-appointment-location-form",
    imports: [CommonModule, InputText, ReactiveFormsModule, Button, TranslatePipe],
    templateUrl: "./appointment-location-form.component.html",
    styleUrl: "./appointment-location-form.component.scss",
})
export class AppointmentLocationFormComponent implements OnInit {
    @Input() type!: ActionType;
    @Input() appointmentLocation!: AppointmentLocation;
    @Input() redirectType!: RedirectType;
    @Input() dialogId!: string;
    @Input() returnUrl!: string;

    form!: FormGroup;

    loadingData!: boolean;

    constructor(
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private helperService: HelperService,
        private appointmentLocationService: AppointmentLocationService,
        private messageService: MessageService,
        private translationService: TranslationService,
    ) {
    }

    ngOnInit(): void {
        const location = this.type == ActionType.Create ? null : this.appointmentLocation;

        this.form = this.formBuilder.group({
            name: [location?.name ?? "", [Validators.required, Validators.maxLength(200)]],
            address: [location?.address ?? "", [Validators.maxLength(300)]],
            latitude: [location?.latitude ?? null, [Validators.required, Validators.min(-90), Validators.max(90)]],
            longitude: [location?.longitude ?? null, [Validators.required, Validators.min(-180), Validators.max(180)]],
            googleMapsUrl: [location?.googleMapsUrl ?? "", [Validators.maxLength(500), Validators.pattern(/^https?:\/\/\S+$/i)]],
        });
    }

    /**
     * Fill latitude and longitude from text copied
     * from Google Maps, e.g. "45.352688, 14.416438".
     */
    onLatitudePaste(event: ClipboardEvent) {
        const text = event.clipboardData?.getData("text") ?? "";
        const match = text.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);

        if (!match) return;

        event.preventDefault();

        this.form.patchValue({latitude: Number(match[1]), longitude: Number(match[2])});
        this.form.get("latitude")?.markAsTouched();
        this.form.get("longitude")?.markAsTouched();
    }

    submit() {
        this.loadingData = true;

        if (this.form.invalid) {
            this.form.markAllAsTouched();

            this.messageService.add({
                severity: "warn",
                summary: this.translationService.t("common.incompleteTitle"),
                detail: this.translationService.t("common.incompleteDetail"),
            });

            this.loadingData = false;

            return;
        }

        const value = this.form.value;

        const request: AppointmentLocationRequest = {
            name: value.name.trim(),
            address: value.address?.trim() || null,
            latitude: Number(value.latitude),
            longitude: Number(value.longitude),
            googleMapsUrl: value.googleMapsUrl?.trim() || null,
        };

        const isCreate = this.type == ActionType.Create;

        const request$ = isCreate
            ? this.appointmentLocationService.createAppointmentLocation(request)
            : this.appointmentLocationService.updateAppointmentLocation(this.appointmentLocation.id, request);

        request$.subscribe({
            next: () => {
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t(isCreate
                        ? "appointmentLocations.createdDetail"
                        : "appointmentLocations.updatedDetail"),
                });

                this.loadingData = false;

                this.helperService.redirectUserAfterSubmit(this.redirectType, this.returnUrl, this.dialogId);
            },
            error: (error) => {
                console.error("Error:", error);

                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t(isCreate
                        ? "appointmentLocations.createErrorSummary"
                        : "appointmentLocations.updateErrorSummary"),
                    detail: getErrorMessage(error),
                });

                this.loadingData = false;
            },
        });
    }
}
