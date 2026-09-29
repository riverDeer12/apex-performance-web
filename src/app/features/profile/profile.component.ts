import {Component, computed, effect, ElementRef, OnInit, ViewChild} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Button} from "primeng/button";
import {InputText} from "primeng/inputtext";
import {MessageService} from "primeng/api";
import {TranslatePipe} from "../../i18n/translate.pipe";
import {TranslationService} from "../../i18n/translation.service";
import {ValidationService} from "../../shared/services/validation.service";
import {getErrorMessage} from "../../constants/error-codes";
import {RedirectType} from "../../enums/redirect-type";
import {
    ChangeUsernameFormComponent
} from "../authentication/components/change-username-form/change-username-form.component";
import {
    ResetPasswordFormComponent
} from "../authentication/components/reset-password-form/reset-password-form.component";
import {Profile} from "./models/profile";
import {
    ALLOWED_PICTURE_TYPES,
    MAX_SELECTED_PICTURE_BYTES,
    MAX_UPLOADED_PICTURE_BYTES,
    ProfileService,
    resizePicture
} from "./services/profile.service";

@Component({
    selector: "app-profile",
    imports: [
        CommonModule,
        ReactiveFormsModule,
        Button,
        InputText,
        TranslatePipe,
        ChangeUsernameFormComponent,
        ResetPasswordFormComponent,
    ],
    templateUrl: "./profile.component.html",
    styleUrl: "./profile.component.scss",
})
export class ProfileComponent implements OnInit {
    @ViewChild("pictureInput") pictureInput!: ElementRef<HTMLInputElement>;

    readonly redirectTypes = RedirectType;

    form!: FormGroup;

    saving = false;
    uploadingPicture = false;

    readonly profile = computed(() => this.profileService.profile());
    readonly hasPersonalData = computed(() => !!this.profile()?.profileType);
    readonly hasPhone = computed(() => ["Client", "Coach"].includes(this.profile()?.profileType ?? ""));

    constructor(
        public profileService: ProfileService,
        public validationService: ValidationService,
        private formBuilder: FormBuilder,
        private messageService: MessageService,
        private translationService: TranslationService,
    ) {
        this.form = this.formBuilder.group({
            email: ["", [Validators.required, Validators.email]],
            firstName: [""],
            lastName: [""],
            phone: [""],
        });

        // Fill form whenever profile is (re)loaded.
        effect(() => {
            const profile = this.profile();
            if (profile) this.fillForm(profile);
        });
    }

    ngOnInit(): void {
        this.profileService.load();
    }

    private fillForm(profile: Profile): void {
        const required = (on: boolean) => on ? [Validators.required] : [];

        this.form.get("firstName")!.setValidators(required(!!profile.profileType));
        this.form.get("lastName")!.setValidators(required(!!profile.profileType));
        this.form.get("phone")!.setValidators(required(["Client", "Coach"].includes(profile.profileType ?? "")));

        this.form.reset({
            email: profile.email,
            firstName: profile.firstName ?? "",
            lastName: profile.lastName ?? "",
            phone: profile.phone ?? "",
        });
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();

            this.messageService.add({
                severity: "warn",
                summary: this.translationService.t("common.incompleteTitle"),
                detail: this.translationService.t("common.incompleteDetail"),
            });

            return;
        }

        const value = this.form.value;

        this.saving = true;

        this.profileService.update({
            email: value.email.trim(),
            firstName: this.hasPersonalData() ? value.firstName.trim() : null,
            lastName: this.hasPersonalData() ? value.lastName.trim() : null,
            phone: this.hasPhone() ? value.phone.trim() : null,
        }).subscribe({
            next: () => {
                this.saving = false;
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t("profile.savedDetail"),
                });
            },
            error: (error) => {
                this.saving = false;
                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("profile.saveErrorSummary"),
                    detail: getErrorMessage(error),
                });
            },
        });
    }

    choosePicture(): void {
        this.pictureInput.nativeElement.click();
    }

    async onPictureSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        input.value = "";

        if (!file) return;

        if (!ALLOWED_PICTURE_TYPES.includes(file.type)) {
            this.showPictureError("profile.pictureInvalidType");
            return;
        }

        if (file.size > MAX_SELECTED_PICTURE_BYTES) {
            this.showPictureError("profile.pictureTooLarge");
            return;
        }

        this.uploadingPicture = true;

        let picture: Blob;

        try {
            picture = await resizePicture(file);
        } catch {
            this.uploadingPicture = false;
            this.showPictureError("profile.pictureInvalidType");
            return;
        }

        // Resized picture is normally ~50 KB, this only guards
        // against unusual images before API rejects them.
        if (picture.size > MAX_UPLOADED_PICTURE_BYTES) {
            this.uploadingPicture = false;
            this.showPictureError("profile.pictureTooLarge");
            return;
        }

        this.profileService.uploadPicture(picture).subscribe({
            next: () => {
                this.uploadingPicture = false;
                this.messageService.add({
                    severity: "success",
                    summary: this.translationService.t("common.success"),
                    detail: this.translationService.t("profile.pictureSavedDetail"),
                });
            },
            error: (error) => {
                this.uploadingPicture = false;
                this.messageService.add({
                    severity: "error",
                    summary: this.translationService.t("profile.pictureErrorSummary"),
                    detail: getErrorMessage(error),
                });
            },
        });
    }

    removePicture(): void {
        this.profileService.deletePicture().subscribe({
            next: () => this.messageService.add({
                severity: "success",
                summary: this.translationService.t("common.success"),
                detail: this.translationService.t("profile.pictureRemovedDetail"),
            }),
        });
    }

    onUsernameChanged(): void {
        this.profileService.load();
    }

    private showPictureError(key: string): void {
        this.messageService.add({
            severity: "warn",
            summary: this.translationService.t("profile.pictureErrorSummary"),
            detail: this.translationService.t(key),
        });
    }
}
